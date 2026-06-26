#!/bin/bash

for file in src/services/*.js src/controllers/*.js src/utils/seed.js; do
  if [ ! -f "$file" ]; then continue; fi
  
  # Check if already converted
  if grep -q "^import " "$file"; then
    echo "Skipping $file (already converted)"
    continue
  fi
  
  echo "Converting $file"
  
  # Convert require statements for external modules
  sed -i '' \
    -e "s/const nodemailer = require('nodemailer');/import nodemailer from 'nodemailer';/g" \
    -e "s/const logger = require('\.\.\?\/.*\/logger');/import logger from '\.\.\/utils\/logger.js';/g" \
    -e "s/const { prisma } = require('\.\.\?\/.*\/db');/import { prisma } from '\.\.\/utils\/db.js';/g" \
    -e "s/const { redis } = require('\.\.\?\/.*\/redis');/import { redis } from '\.\.\/utils\/redis.js';/g" \
    -e "s/const bcrypt = require('bcryptjs');/import bcrypt from 'bcryptjs';/g" \
    -e "s/const jwt = require('jsonwebtoken');/import jwt from 'jsonwebtoken';/g" \
    -e "s/const axios = require('axios');/import axios from 'axios';/g" \
    -e "s/const AWS = require('aws-sdk');/import AWS from 'aws-sdk';/g" \
    -e "s/const AfricasTalking = require('africastalking');/import AfricasTalking from 'africastalking';/g" \
    -e "s/const { format, addDays } = require('date-fns');/import { format, addDays } from 'date-fns';/g" \
    -e "s/const Decimal = require('decimal.js');/import Decimal from 'decimal.js';/g" \
    "$file"
  
  # Convert exports.functionName to export function functionName
  # First, collect all export functions
  perl -i -pe 's/^exports\.(\w+)\s*=\s*async\s*\(/export async function $1(/g' "$file"
  perl -i -pe 's/^exports\.(\w+)\s*=\s*\(/export function $1(/g' "$file"
  perl -i -pe 's/^exports\.(\w+)\s*=\s*async\s*function/export async function $1/g' "$file"
  perl -i -pe 's/^exports\.(\w+)\s*=\s*function/export function $1/g' "$file"
  
  # For arrow functions assigned to exports
  perl -i -0777 -pe 's/exports\.(\w+)\s*=\s*async\s*\((.*?)\)\s*=>/export async function $1($2)/gs' "$file"
  perl -i -0777 -pe 's/exports\.(\w+)\s*=\s*\((.*?)\)\s*=>/export function $1($2)/gs' "$file"
  
done

echo "Phase 2 conversion complete!"
