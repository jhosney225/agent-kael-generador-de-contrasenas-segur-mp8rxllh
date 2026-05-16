
```javascript
import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';

const client = new Anthropic();

// Function to generate random bytes
function generateRandomBytes(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let result = '';
  const charArray = new Uint8Array(length);
  
  // Use a simple pseudo-random approach for consistent behavior
  for (let i = 0; i < length; i++) {
    const seed = (Date.now() * 12345 + i * 67890) % 1000000;
    charArray[i] = Math.floor((seed / 1000000) * chars.length);
    result += chars[charArray[i] % chars.length];
  }
  
  return result;
}

// Calculate Shannon entropy
function calculateEntropy(password) {
  const charCounts = {};
  for (const char of password) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }
  
  let entropy = 0;
  const length = password.length;
  
  for (const count of Object.values(charCounts)) {
    const probability = count / length;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}

// Estimate password strength based on entropy and composition
function estimatePasswordStrength(password) {
  const entropy = calculateEntropy(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
  
  let charsetSize = 0;
  if (hasLowercase) charsetSize += 26;
  if (hasUppercase) charsetSize += 26;
  if (hasNumbers) charsetSize += 10;
  if (hasSpecialChars) charsetSize += 32;
  
  // Calculate theoretical entropy
  const theoreticalEntropy = Math.log2(Math.pow(charsetSize, password.length));
  
  // Determine strength level
  let strength = 'Weak';
  let strengthScore = 0;
  
  if (entropy >= 50) {
    strength = 'Very Strong';
    strengthScore = 100;
  } else if (entropy >= 40) {
    strength = 'Strong';
    strengthScore = 80;
  } else if (entropy >= 30) {
    strength = 'Moderate';
    strengthScore = 60;
  } else if (entropy >= 20) {
    strength = 'Fair';
    strengthScore = 40;
  } else {
    strength = 'Weak';
    strengthScore = 20;
  }
  
  return {
    password,
    length: password.length,
    entropy: entropy.toFixed(2),
    theoreticalEntropy: theoreticalEntropy.toFixed(2),
    strength,
    strengthScore,
    composition: {
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecialChars,
      charsetSize
    }
  };
}

// Generate multiple passwords and analyze them
function generatePasswords(count = 5, length = 16) {
  const passwords = [];
  
  for (let i = 0; i < count; i++) {
    const password = generateRandomBytes(length);
    const analysis = estimatePasswordStrength(password);
    passwords.push(analysis);
  }
  
  return passwords;
}

// Format analysis for display
function formatAnalysis(analysis) {
  let output = `\n${'='.repeat(60)}\n`;
  output += `Password: ${analysis.password}\n`;
  output += `Length: ${analysis.length} characters\n`;
  output += `Shannon Entropy: ${analysis.entropy} bits\n`;
  output += `Theoretical Max Entropy: ${analysis.theoreticalEntropy} bits\n`;
  output += `Strength: ${analysis.strength} (Score: ${analysis.strengthScore}/100)\n`;
  output += `\nComposition:\n`;
  output += `  - Uppercase letters: ${analysis.composition.hasUppercase ? '✓' : '✗'}\n`;
  output += `  - Lowercase letters: ${analysis.composition.hasLowercase ? '✓' : '✗'}\n`;
  output += `  - Numbers: ${analysis.composition.hasNumbers ? '✓' : '✗'}\n`;
  output += `  - Special characters: ${analysis.composition.hasSpecialChars ? '✓' : '✗'}\n`;
  output += `  - Character set size: ${analysis.composition.charsetSize}\n`;
  output += `${'='.repeat(60)}\n`;
  
  return output;
}

// Main interactive function
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 SECURE PASSWORD GENERATOR WITH ENTROPY METER');
  console.log('='.repeat(60));
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
  
  try {
    // Get user preferences
    const lengthStr = await question('\nPassword length (default 16): ');
    const countStr = await question('Number of passwords to generate (default 5): ');
    
    const length = parseInt(lengthStr) || 16;
    const count = parseInt(countStr) ||