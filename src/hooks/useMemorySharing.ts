
import { useState, useCallback } from 'react';

export interface ShareLink {
  id: string;
  memoryId: string;
  url: string;
  isPublic: boolean;
  expiresAt?: string;
  password?: string;
  allowDownload: boolean;
  allowComments: boolean;
  createdAt: string;
  views: number;
}

export const useMemorySharing = () => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);

  const createShareLink = useCallback((
    memoryId: string,
    options: {
      isPublic: boolean;
      expiresAt?: string;
      password?: string;
      allowDownload: boolean;
      allowComments: boolean;
    }
  ) => {
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = window.location.origin;
    
    const newShareLink: ShareLink = {
      id: shareId,
      memoryId,
      url: `${baseUrl}/shared/${shareId}`,
      createdAt: new Date().toISOString(),
      views: 0,
      ...options
    };

    setShareLinks(prev => [...prev, newShareLink]);
    return newShareLink;
  }, []);

  const updateShareLink = useCallback((linkId: string, updates: Partial<ShareLink>) => {
    setShareLinks(prev => prev.map(link => 
      link.id === linkId ? { ...link, ...updates } : link
    ));
  }, []);

  const deleteShareLink = useCallback((linkId: string) => {
    setShareLinks(prev => prev.filter(link => link.id !== linkId));
  }, []);

  const getShareLink = useCallback((linkId: string) => {
    return shareLinks.find(link => link.id === linkId);
  }, [shareLinks]);

  const getMemoryShareLinks = useCallback((memoryId: string) => {
    return shareLinks.filter(link => link.memoryId === memoryId);
  }, [shareLinks]);

  const incrementViews = useCallback((linkId: string) => {
    setShareLinks(prev => prev.map(link => 
      link.id === linkId ? { ...link, views: link.views + 1 } : link
    ));
  }, []);

  const validateAccess = useCallback((linkId: string, password?: string) => {
    const link = shareLinks.find(l => l.id === linkId);
    if (!link) return { valid: false, reason: 'Link not found' };

    // Check if expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return { valid: false, reason: 'Link has expired' };
    }

    // Check password
    if (link.password && link.password !== password) {
      return { valid: false, reason: 'Invalid password' };
    }

    return { valid: true, link };
  }, [shareLinks]);

  return {
    shareLinks,
    createShareLink,
    updateShareLink,
    deleteShareLink,
    getShareLink,
    getMemoryShareLinks,
    incrementViews,
    validateAccess
  };
};
