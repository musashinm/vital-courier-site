---
title: Privacy Policy
updated: 2026-10-09
---

Vital Courier exports your Apple Health data to a folder you choose. It has no account and no server, and it sends nothing to its developer or to anyone else.

## What Vital Courier reads

With your permission, Vital Courier reads four kinds of data from Apple Health:

- Steps
- Resting Heart Rate
- Body Weight
- Sleep

It asks for read access only and never writes to or changes your Health data. When iOS asks, you choose which of the four to allow.

For each reading, it gets the reading's identifier, its start and end time, its value, the name of the app or device that recorded it, the device name when Health has one, and any extra details Health stores with the reading (its metadata, such as whether a value was entered by hand).

## Reading in the background

Vital Courier asks iOS to wake it when new Health data arrives, so your exports stay current without you opening the app. It can read and export data while it runs in the background. It may also schedule a background run, at least an hour later, to retry an export that didn't finish.

If Health data is unavailable while your iPhone is locked, Vital Courier skips that read and tries again at its next chance: the next time new Health data wakes it, its next background run, or the next time you open the app.

## Where your data goes

Vital Courier writes export files into the one folder you pick in the Files app. That can be On My iPhone, iCloud Drive, Dropbox or any other storage provider that shows up in Files. The files contain the fields listed above.

Once the files are in that folder, the storage provider handles them under its own terms and privacy policy. Files in iCloud Drive sync through iCloud, for example, and files in Dropbox sync through Dropbox. Vital Courier never deletes files it has already exported.

## What stays on your iPhone

Apart from the export files, Vital Courier saves only what it needs to work, and only on your iPhone, in its own storage:

- A protected local copy of the data it has read from Health, including data still waiting to be exported, with the same fields as the export plus each reading's time zone and the day and month it belongs to
- Other working data derived from your Health data, such as daily values and which days still need export
- Your settings
- A record of which readings were already exported
- A history of export runs
- The saved permission to write to your chosen folder

Vital Courier doesn't use iCloud or CloudKit to store or sync any of this. It marks its local Health-data copy, export records, export history and other working data to be excluded from iPhone backups. Apple treats this as a request and doesn't guarantee it. The chosen folder and other settings, along with any pending setup or file-protection error messages, may be included in an iPhone backup.

## Keeping and deleting data

In Settings, Clear local copy deletes the local copy of your Health readings. It doesn't touch your data in Apple Health or the files already exported, and your settings, export history and folder choice stay. The next run that can read Health data reads the four data types from Health again.

To delete exported files, delete them in the Files app or in your storage provider.

## Turning off access

You can turn off Vital Courier's access to any or all of the four data types at any time:

- In the Health app: tap your profile picture, then Apps, then Vital Courier
- In Settings: Health, then Data Access & Devices, then Vital Courier

To stop exports to a folder, pick a different folder in Vital Courier. If you delete the folder in Files, Vital Courier can no longer write to it and doesn't recreate it.

## What is never collected

Vital Courier has no account and no sign-in. It contains no analytics, advertising, tracking or crash reporting, and it makes no network connections of its own. Your Health data never reaches the developer.

## Children

Vital Courier isn't directed at children, and its developer collects nothing from anyone, children included.

## Changes to this policy

When this policy changes, the date at the top changes with it. Every earlier version stays public: the policy lives in a public GitHub repository, and the link at the top of this page shows its full history.

## Contact

Send questions as an issue on [GitHub](https://github.com/musashinm/vital-courier-site/issues). Issues are public, so anyone can read them. Please don't post health information or anything else private in one. GitHub handles your account and profile data under its own [privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
