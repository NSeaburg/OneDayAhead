import { generateKeyPair } from 'crypto';
import { promisify } from 'util';
// Note: node-jose has import issues, so we'll skip the complex key management for now

const generateKeyPairAsync = promisify(generateKeyPair);

export interface LtiConfig {
  issuer: string;
  clientId: string;
  deploymentId: string;
  privateKey: string;
  publicKey: string;
  keySetUrl: string;
  loginUrl: string;
  launchUrl: string;
  jwksUrl: string;
  deepLinkingUrl: string;
}

export class LtiKeyManager {
  private static instance: LtiKeyManager;
  private keyStore: jose.JWK.KeyStore;
  private initialized = false;

  private constructor() {
    this.keyStore = jose.JWK.createKeyStore();
  }

  static getInstance(): LtiKeyManager {
    if (!LtiKeyManager.instance) {
      LtiKeyManager.instance = new LtiKeyManager();
    }
    return LtiKeyManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Generate or load existing key pair
    const { publicKey, privateKey } = await this.generateOrLoadKeyPair();
    
    // Add key to store
    await this.keyStore.add(privateKey, 'pem');
    this.initialized = true;
  }

  private async generateOrLoadKeyPair() {
    // In production, load from environment variables or secure storage
    const existingPrivateKey = process.env.LTI_PRIVATE_KEY;
    const existingPublicKey = process.env.LTI_PUBLIC_KEY;

    if (existingPrivateKey && existingPublicKey) {
      return {
        privateKey: existingPrivateKey,
        publicKey: existingPublicKey
      };
    }

    // Generate new key pair if none exists
    const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    console.log('Generated new RSA key pair for LTI 1.3');
    console.log('Public Key:', publicKey);
    console.log('Private Key (store securely):', privateKey);

    return { publicKey, privateKey };
  }

  async getPublicKeySet(): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.keyStore.toJSON();
  }

  async getPrivateKey(): Promise<jose.JWK.Key> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.keyStore.all()[0];
  }
}

export function getLtiConfig(): LtiConfig {
  // Hardcoded to use onedayahead.com domain
  const baseUrl = 'https://app.onedayahead.com';

  return {
    issuer: process.env.LTI_ISSUER || 'https://canvas.instructure.com',
    clientId: process.env.LTI_CLIENT_ID || '',
    deploymentId: process.env.LTI_DEPLOYMENT_ID || '',
    privateKey: process.env.LTI_PRIVATE_KEY || '',
    publicKey: process.env.LTI_PUBLIC_KEY || '',
    keySetUrl: `${baseUrl}/api/lti/jwks`,
    loginUrl: `${baseUrl}/api/lti/login`,
    launchUrl: `${baseUrl}/api/lti/launch`,
    jwksUrl: `${baseUrl}/api/lti/jwks`,
    deepLinkingUrl: `${baseUrl}/api/lti/deep-linking`,
  };
}

export function validateLtiConfig(): boolean {
  const config = getLtiConfig();
  const required = ['issuer', 'clientId'];
  
  return required.every(key => config[key as keyof LtiConfig]);
}