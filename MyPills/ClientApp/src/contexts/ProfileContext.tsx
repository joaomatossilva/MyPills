import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { requestJson } from '../api/apiClient'
import { useAuth } from './AuthContext'
import { useLanguage } from './LanguageContext'
import type { OwnedProfilesResponse } from '../types/api'

const selectedProfileStorageKey = 'mypills-selected-profile-id'

export interface SelectableProfile {
  id: string
  name: string
  canEdit: boolean
  isDefault: boolean
}

interface ProfileContextValue {
  profiles: SelectableProfile[]
  selectedProfileId: string | null
  selectedProfile: SelectableProfile | null
  loading: boolean
  error: string | null
  selectProfile: (profileId: string) => void
  refreshProfiles: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

function getStoredSelectedProfileId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(selectedProfileStorageKey)
}

function setStoredSelectedProfileId(profileId: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (profileId) {
    window.localStorage.setItem(selectedProfileStorageKey, profileId)
    return
  }

  window.localStorage.removeItem(selectedProfileStorageKey)
}

function resolveSelectedProfileId(profiles: SelectableProfile[], currentProfileId: string | null) {
  if (currentProfileId && profiles.some(profile => profile.id === currentProfileId)) {
    return currentProfileId
  }

  const defaultProfile = profiles.find(profile => profile.isDefault)
  if (defaultProfile) {
    return defaultProfile.id
  }

  return profiles[0]?.id ?? null
}

function mapProfiles(ownedProfiles: OwnedProfilesResponse['profiles']): SelectableProfile[] {
  return ownedProfiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    canEdit: true,
    isDefault: profile.isDefault
  }))
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { text } = useLanguage()
  const [profiles, setProfiles] = useState<SelectableProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(() => getStoredSelectedProfileId())
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshProfiles = useCallback(async () => {
    if (!isAuthenticated) {
      setProfiles([])
      setSelectedProfileId(null)
      setStoredSelectedProfileId(null)
      setError(null)
      setProfilesLoading(false)
      return
    }

    setProfilesLoading(true)
    setError(null)

    try {
      const ownedResult = await requestJson<OwnedProfilesResponse>('/api/profiles')

      if (!ownedResult.response.ok) {
        throw new Error(text.profiles.failedList)
      }

      const nextProfiles = mapProfiles(ownedResult.data?.profiles ?? [])
      const nextSelectedProfileId = resolveSelectedProfileId(nextProfiles, getStoredSelectedProfileId() ?? selectedProfileId)

      setProfiles(nextProfiles)
      setSelectedProfileId(nextSelectedProfileId)
      setStoredSelectedProfileId(nextSelectedProfileId)
    } catch (loadError) {
      setProfiles([])
      setSelectedProfileId(null)
      setStoredSelectedProfileId(null)
      setError((loadError as Error).message ?? text.profiles.failedList)
    } finally {
      setProfilesLoading(false)
    }
  }, [isAuthenticated, selectedProfileId, text.profiles.failedList])

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated) {
      setProfiles([])
      setSelectedProfileId(null)
      setError(null)
      setProfilesLoading(false)
      return
    }

    void refreshProfiles()
  }, [authLoading, isAuthenticated, refreshProfiles])

  const selectProfile = useCallback((profileId: string) => {
    setSelectedProfileId(profileId)
    setStoredSelectedProfileId(profileId)
  }, [])

  const selectedProfile = useMemo(
    () => profiles.find(profile => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  )

  const contextValue = useMemo<ProfileContextValue>(() => ({
    profiles,
    selectedProfileId,
    selectedProfile,
    loading: authLoading || (isAuthenticated && profilesLoading),
    error,
    selectProfile,
    refreshProfiles
  }), [authLoading, error, isAuthenticated, profiles, profilesLoading, refreshProfiles, selectProfile, selectedProfile, selectedProfileId])

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }

  return context
}
