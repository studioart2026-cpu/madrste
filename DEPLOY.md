# Deployment

This project writes runtime data to JSON files, so it must be deployed on hosting that supports a writable persistent disk.

## Required environment variables

- `AUTH_SESSION_SECRET`: a long random secret used to sign sessions.
- `DATA_DIRECTORY`: path to the mounted persistent storage directory. Example: `/app/data`.

## Docker

Build the image:

```bash
docker build -t madrsa .
```

Run locally:

```bash
docker run -p 3000:3000 -e AUTH_SESSION_SECRET=change-me -e DATA_DIRECTORY=/app/data -v madrsa-data:/app/data madrsa
```

## Hosting notes

- Use a service with persistent storage, such as Railway volumes or Render persistent disks.
- Do not deploy this version to hosts that only provide temporary serverless filesystem storage.
