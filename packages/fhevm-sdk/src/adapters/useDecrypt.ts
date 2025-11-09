/**
 * Wagmi-like hook for decryption operations
 */

import { useState, useCallback } from 'react';
import { decryptValue, publicDecrypt, decryptMultipleHandles } from '../core/index.js';

export function useDecrypt() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string>('');

  const decrypt = useCallback(async (handle: string, contractAddress: string, signer: any) => {
    setIsDecrypting(true);
    setError('');
    
    try {
      const result = await decryptValue(handle, contractAddress, signer);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const publicDecryptValue = useCallback(async (handle: string) => {
    setIsDecrypting(true);
    setError('');
    
    try {
      const result = await publicDecrypt(handle);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Public decryption failed');
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const decryptMultiple = useCallback(async (contractAddress: string, signer: any, handles: string[]) => {
    setIsDecrypting(true);
    setError('');
    
    try {
      const result = await decryptMultipleHandles(contractAddress, signer, handles);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Multiple decryption failed');
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  return {
    decrypt,
    publicDecrypt: publicDecryptValue,
    decryptMultiple,
    isDecrypting,
    error,
  };
}
