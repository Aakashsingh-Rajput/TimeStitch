
import { useState, useCallback } from 'react';

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  isOnline: boolean;
}

export interface CollaborationInvite {
  id: string;
  projectId: string;
  email: string;
  role: 'editor' | 'viewer';
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const useCollaboration = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      joinedAt: '2024-01-01',
      isOnline: true
    }
  ]);
  
  const [invites, setInvites] = useState<CollaborationInvite[]>([]);

  const inviteCollaborator = useCallback((email: string, role: 'editor' | 'viewer', projectId: string) => {
    const newInvite: CollaborationInvite = {
      id: `invite_${Date.now()}`,
      projectId,
      email,
      role,
      invitedBy: 'current-user', // Would be actual user ID
      invitedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    setInvites(prev => [...prev, newInvite]);
    
    // In real implementation, this would send an email invitation
    console.log(`Invitation sent to ${email} for ${role} role`);
    
    return newInvite;
  }, []);

  const removeCollaborator = useCallback((collaboratorId: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
  }, []);

  const updateCollaboratorRole = useCallback((collaboratorId: string, newRole: 'editor' | 'viewer') => {
    setCollaborators(prev => prev.map(c => 
      c.id === collaboratorId ? { ...c, role: newRole } : c
    ));
  }, []);

  const acceptInvite = useCallback((inviteId: string) => {
    const invite = invites.find(i => i.id === inviteId);
    if (!invite) return;

    const newCollaborator: Collaborator = {
      id: `collab_${Date.now()}`,
      name: 'New User', // Would come from user profile
      email: invite.email,
      role: invite.role,
      joinedAt: new Date().toISOString(),
      isOnline: true
    };

    setCollaborators(prev => [...prev, newCollaborator]);
    setInvites(prev => prev.map(i => 
      i.id === inviteId ? { ...i, status: 'accepted' as const } : i
    ));
  }, [invites]);

  const rejectInvite = useCallback((inviteId: string) => {
    setInvites(prev => prev.map(i => 
      i.id === inviteId ? { ...i, status: 'rejected' as const } : i
    ));
  }, []);

  const getPermissions = useCallback((userId: string) => {
    const collaborator = collaborators.find(c => c.id === userId);
    if (!collaborator) return { canEdit: false, canDelete: false, canInvite: false };

    return {
      canEdit: collaborator.role === 'owner' || collaborator.role === 'editor',
      canDelete: collaborator.role === 'owner',
      canInvite: collaborator.role === 'owner'
    };
  }, [collaborators]);

  return {
    collaborators,
    invites,
    inviteCollaborator,
    removeCollaborator,
    updateCollaboratorRole,
    acceptInvite,
    rejectInvite,
    getPermissions
  };
};
