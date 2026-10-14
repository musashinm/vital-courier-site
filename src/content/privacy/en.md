---
title: Privacy Policy
updated: 2026-10-14
---

Vital Courier exports your Apple Health data to a folder you choose. It has no account and no server, and it sends nothing to its developer or to anyone else.

## What Vital Courier reads

With your permission, Vital Courier reads four kinds of data from Apple Health:

- Steps
- Resting Heart Rate
- Body Weight
- Sleep

If you turn on Cycle tracking in Vital Courier's Settings, it also reads two more:

- Menstrual Flow, including whether you marked a day as the start of a period
- Spotting

Cycle tracking is off until you turn it on.

It asks for read access only and never writes to or changes your Health data. When iOS asks, you choose which of these to allow.

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

In Settings, Clear local copy deletes the local copy of your Health readings. It doesn't touch your data in Apple Health or the files already exported, and your settings, export history and folder choice stay. The next run that can read Health data reads the data types you have turned on from Health again.

To delete exported files, delete them in the Files app or in your storage provider.

Deleting Vital Courier from your iPhone deletes everything it keeps in its own storage, including the local copy of your Health data. Your data in Apple Health and the files already exported stay where they are, and so does anything already saved in an iPhone backup.

## Turning off access

You can turn off Vital Courier's access to any or all of these data types at any time:

- In the Health app: tap your profile picture, then Apps, then Vital Courier
- In Settings: Health, then Data Access & Devices, then Vital Courier

Turning off Cycle tracking in Vital Courier's Settings stops it reading Menstrual Flow and Spotting. Files already exported and the local copy stay. Clear local copy deletes the local copy.

To stop exports to a folder, pick a different folder in Vital Courier. If you delete the folder in Files, Vital Courier can no longer write to it and doesn't recreate it.

## What is never collected

The Vital Courier app has no account and no sign-in. It contains no analytics, advertising, tracking or crash reporting, and it makes no network connections of its own. Your Health data never reaches the developer.

## This website

This website, vitalcourier.app, uses Cloudflare Web Analytics to count visits. When you open a page in a browser, Cloudflare adds a small script that sends Cloudflare a report on how the page loaded. The report includes the page address, the address of the page that linked you here if your browser shares it, your browser and operating system versions, how long the page took to load, how much memory the page's scripts used, and a random ID for that one page load. As with any web request, Cloudflare also sees your IP address, which it uses to tell which country the visit came from.

The site sets no cookies and stores nothing in your browser. Cloudflare says Web Analytics doesn't collect or use visitors' personal data and doesn't track individual people across websites. It keeps every report for seven days, then a sample of about one in ten. The developer sees summary reports in Cloudflare's dashboard, such as page views by country, page, referring site, device type, browser and operating system, for the last six months. Ad blockers often block the script, and the page works the same without it. Cloudflare also hosts this site, so it handles every request to it, not only these reports, under its own [privacy policy](https://www.cloudflare.com/policies/privacy/).

Cloudflare's Workers Logs and Traces are also turned on for this site. They only record requests that run code on Cloudflare's servers, and this site is only static files, so today they record nothing. If the site ever runs such code, these records may include the page address, your IP address, the approximate location Cloudflare works out from it (such as country, region and city), your network provider, your browser's user agent, the page that linked you here and your language settings. Cloudflare keeps them for no more than seven days.

## Children

Vital Courier isn't directed at children. The app collects nothing from anyone, children included, and this website gathers only the visit statistics described above.

## Changes to this policy

When this policy changes, the date at the top changes with it. Every earlier version stays public: the policy lives in a public GitHub repository, and the link at the top of this page shows its full history.

## Contact

Send questions as an issue on [GitHub](https://github.com/musashinm/vital-courier-site/issues). Issues are public, so anyone can read them. Please don't post health information or anything else private in one. GitHub handles your account and profile data under its own [privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).
