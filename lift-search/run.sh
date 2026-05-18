#!/bin/bash
cd "$(dirname "$0")"
if [ ! -f .env ]; then
  echo "Error: .env file not found. Copy .env.example to .env and add your ANTHROPIC_API_KEY."
  exit 1
fi
python3 app.py
