#!/usr/bin/env node

/**
 * Generate secure random keys for Directus configuration
 * Usage: node scripts/generate-directus-keys.js
 */

const crypto = require('crypto');

console.log('\n🔐 Directus Key Generator\n');
console.log('=' .repeat(50));

// Generate KEY (minimum 32 characters)
const key = crypto.randomBytes(32).toString('hex');
console.log('\n📝 KEY (copy this to Railway):');
console.log(key);
console.log(`\n   Length: ${key.length} characters ✅`);

// Generate SECRET (minimum 32 characters)
const secret = crypto.randomBytes(32).toString('hex');
console.log('\n🔑 SECRET (copy this to Railway):');
console.log(secret);
console.log(`\n   Length: ${secret.length} characters ✅`);

console.log('\n' + '='.repeat(50));
console.log('\n✅ Copy these values to your Railway environment variables:');
console.log('   KEY=' + key);
console.log('   SECRET=' + secret);
console.log('\n⚠️  Keep these secure and never commit them to git!\n');

