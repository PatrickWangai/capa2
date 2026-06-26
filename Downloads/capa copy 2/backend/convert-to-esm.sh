#!/bin/bash

find src -name "*.js" -type f | while read file; do
  # Skip already converted files
  if grep -q "^import\|^export" "$file" 2>/dev/null; then
    continue
  fi
  
  # Convert require statements
  sed -i '' \
    -e "s/const \(.*\) = require('\(.*\)');/import \1 from '\2.js';/g" \
    -e "s/const \(.*\) = require(\"\(.*\)\");/import \1 from '\"\2.js\";/g" \
    -e "s/const { \(.*\) } = require('\(.*\)');/import { \1 } from '\2.js';/g" \
    -e "s/const { \(.*\) } = require(\"\(.*\)\");/import { \1 } from \"\2.js\";/g" \
    -e "s/require('\(.*\)')/import('\1.js')/g" \
    -e "s/require(\"\(.*\)\")/import('\1.js')/g" \
    "$file"
  
  # Convert module.exports
  sed -i '' \
    -e "s/module\.exports = /export default /g" \
    -e "s/module\.exports\.default = /export default /g" \
    -e "s/module\.exports = {/export {/g" \
    "$file"
  
  # Fix imports from node_modules (remove .js from them)
  sed -i '' \
    -e "s|from '@prisma/client.js'|from '@prisma/client'|g" \
    -e "s|from 'express.js'|from 'express'|g" \
    -e "s|from 'jsonwebtoken.js'|from 'jsonwebtoken'|g" \
    -e "s|from 'bcryptjs.js'|from 'bcryptjs'|g" \
    -e "s|from 'winston.js'|from 'winston'|g" \
    -e "s|from 'ioredis.js'|from 'ioredis'|g" \
    -e "s|from 'joi.js'|from 'joi'|g" \
    -e "s|from 'bull.js'|from 'bull'|g" \
    -e "s|from 'axios.js'|from 'axios'|g" \
    -e "s|from 'socket.io.js'|from 'socket.io'|g" \
    -e "s|from 'nodemailer.js'|from 'nodemailer'|g" \
    -e "s|from 'multer.js'|from 'multer'|g" \
    -e "s|from 'uuid.js'|from 'uuid'|g" \
    -e "s|from 'qrcode.js'|from 'qrcode'|g" \
    -e "s|from 'speakeasy.js'|from 'speakeasy'|g" \
    -e "s|from 'aws-sdk.js'|from 'aws-sdk'|g" \
    -e "s|from 'africastalking.js'|from 'africastalking'|g" \
    -e "s|from 'date-fns.js'|from 'date-fns'|g" \
    -e "s|from 'decimal.js.js'|from 'decimal.js'|g" \
    -e "s|from 'dotenv.js'|from 'dotenv'|g" \
    "$file"
done

echo "Conversion complete!"
