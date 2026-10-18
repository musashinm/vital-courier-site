import { crc32, inflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');
const PNG_SIGNATURE_LENGTH = PNG_SIGNATURE.length;
const PNG_CHUNK_LENGTH_SIZE = 4;
const PNG_CHUNK_TYPE_SIZE = 4;
const PNG_CHUNK_CRC_SIZE = 4;

export type PngChunk = { type: string; data: Buffer };

// Walks every chunk after the signature and throws on a bad CRC or a chunk that overruns the file.
export function readPngChunks(png: Buffer): {
  chunks: PngChunk[];
  endOffset: number;
} {
  const chunks: PngChunk[] = [];
  let offset = PNG_SIGNATURE_LENGTH;
  while (offset < png.length) {
    const headerSize = PNG_CHUNK_LENGTH_SIZE + PNG_CHUNK_TYPE_SIZE;
    if (offset + headerSize > png.length) {
      throw new Error(`Truncated chunk header at offset ${offset}`);
    }
    const dataLength = png.readUInt32BE(offset);
    const typeStart = offset + PNG_CHUNK_LENGTH_SIZE;
    const dataStart = typeStart + PNG_CHUNK_TYPE_SIZE;
    const crcStart = dataStart + dataLength;
    const chunkEnd = crcStart + PNG_CHUNK_CRC_SIZE;
    if (chunkEnd > png.length) {
      throw new Error(
        `Chunk at offset ${offset} runs past the end of the file`,
      );
    }
    const type = png.subarray(typeStart, dataStart).toString('ascii');
    const storedCrc = png.readUInt32BE(crcStart);
    const actualCrc = crc32(png.subarray(typeStart, crcStart));
    if (storedCrc !== actualCrc) {
      throw new Error(`Bad CRC in ${type} chunk at offset ${offset}`);
    }
    chunks.push({ type, data: png.subarray(dataStart, crcStart) });
    offset = chunkEnd;
  }
  return { chunks, endOffset: offset };
}

const PNG_IHDR_DATA_LENGTH = 13;
const PNG_FILTER_TYPE_MAX = 4;
const PNG_KNOWN_CRITICAL_CHUNK_TYPES = ['IHDR', 'PLTE', 'IDAT', 'IEND'];
const PNG_CHANNELS_BY_COLOR_TYPE: Record<number, number> = {
  0: 1,
  2: 3,
  3: 1,
  4: 2,
  6: 4,
};
const PNG_BIT_DEPTHS_BY_COLOR_TYPE: Record<number, number[]> = {
  0: [1, 2, 4, 8, 16],
  2: [8, 16],
  3: [1, 2, 4, 8],
  4: [8, 16],
  6: [8, 16],
};

// Throws unless the file is a structurally valid, non-interlaced PNG of the expected size.
export function validatePng(
  png: Buffer,
  expectedWidth: number,
  expectedHeight: number,
): void {
  if (!png.subarray(0, PNG_SIGNATURE_LENGTH).equals(PNG_SIGNATURE)) {
    throw new Error('Missing PNG signature');
  }
  const { chunks, endOffset } = readPngChunks(png);
  if (endOffset !== png.length) throw new Error('Data after the last chunk');
  const types = chunks.map((chunk) => chunk.type);

  const countOf = (type: string) => types.filter((t) => t === type).length;
  if (countOf('IHDR') !== 1) throw new Error('Expected exactly one IHDR');
  if (countOf('PLTE') > 1) throw new Error('More than one PLTE');
  const unknownCriticalType = types.find(
    (type) =>
      type[0] === type[0].toUpperCase() &&
      !PNG_KNOWN_CRITICAL_CHUNK_TYPES.includes(type),
  );
  if (unknownCriticalType) {
    throw new Error(`Unknown critical chunk ${unknownCriticalType}`);
  }

  const ihdr = chunks[0];
  if (ihdr?.type !== 'IHDR') throw new Error('First chunk is not IHDR');
  if (ihdr.data.length !== PNG_IHDR_DATA_LENGTH) {
    throw new Error(`IHDR has ${ihdr.data.length} data bytes, expected 13`);
  }
  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);
  const [bitDepth, colorType, compression, filter, interlace] = [
    ihdr.data[8],
    ihdr.data[9],
    ihdr.data[10],
    ihdr.data[11],
    ihdr.data[12],
  ];
  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error(`Size is ${width} x ${height}`);
  }
  if (!PNG_BIT_DEPTHS_BY_COLOR_TYPE[colorType]?.includes(bitDepth)) {
    throw new Error(
      `Invalid bit depth ${bitDepth} for color type ${colorType}`,
    );
  }
  if (compression !== 0 || filter !== 0 || interlace !== 0) {
    throw new Error('Compression, filter and interlace must all be 0');
  }

  const firstIdat = types.indexOf('IDAT');
  const lastIdat = types.lastIndexOf('IDAT');
  if (firstIdat === -1) throw new Error('No IDAT chunk');
  if (types.slice(firstIdat, lastIdat + 1).some((t) => t !== 'IDAT')) {
    throw new Error('IDAT chunks are not consecutive');
  }
  if (types.lastIndexOf('PLTE') > firstIdat) {
    throw new Error('PLTE comes after IDAT');
  }
  const iend = chunks.at(-1);
  if (iend?.type !== 'IEND' || types.indexOf('IEND') !== types.length - 1) {
    throw new Error('IEND is not the single last chunk');
  }
  if (iend.data.length !== 0) throw new Error('IEND has data');

  const imageData = inflateSync(
    Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data)),
  );
  const scanlineLength =
    1 +
    Math.ceil((width * PNG_CHANNELS_BY_COLOR_TYPE[colorType] * bitDepth) / 8);
  if (imageData.length !== height * scanlineLength) {
    throw new Error(
      `Image data is ${imageData.length} bytes, expected ${height * scanlineLength}`,
    );
  }
  for (let row = 0; row < height; row++) {
    if (imageData[row * scanlineLength] > PNG_FILTER_TYPE_MAX) {
      throw new Error(`Scanline ${row} has an invalid filter type`);
    }
  }
}
