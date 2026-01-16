#!/bin/sh

# Print environment variables for debugging
echo "=== Environment Variables ==="
echo "API_URL: ${API_URL}"
echo "FIREBASE_API_KEY: ${FIREBASE_API_KEY}"
echo "============================="

# Replace environment variables in env.js template
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Print the generated env.js for debugging
echo "=== Generated env.js ==="
cat /usr/share/nginx/html/env.js
echo "========================"

# Start nginx
exec nginx -g "daemon off;"
