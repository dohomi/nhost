import { useMemo } from 'react'

import {
  ChangeEmailOptions,
  createChangeEmailMachine,
  createChangePasswordMachine,
  createEnableMfaMachine,
  createResetPasswordMachine,
  createSendVerificationEmailMachine,
  ResetPasswordOptions,
  SendVerificationEmailOptions
} from '@nhost/core'
import { useMachine, useSelector } from '@xstate/react'

import { useAuthInterpreter, useNhostClient } from './common'

export const useChangeEmail = (stateEmail?: string, stateOptions?: ChangeEmailOptions) => {
  const nhost = useNhostClient()
  const machine = useMemo(() => createChangeEmailMachine(nhost.auth.client), [nhost])
  const [current, send] = useMachine(machine)

  const isError = current.matches({ idle: 'error' })
  const needsEmailVerification = current.matches({ idle: 'success' })
  const error = current.context.error
  const isLoading = current.matches('requesting')

  const changeEmail = (valueEmail?: string | unknown, valueOptions = stateOptions) =>
    send({
      type: 'REQUEST',
      email: typeof valueEmail === 'string' ? valueEmail : stateEmail,
      options: valueOptions
    })
  return { changeEmail, isLoading, needsEmailVerification, isError, error }
}

export const useChangePassword = (statePassword?: string) => {
  const nhost = useNhostClient()
  const machine = useMemo(() => createChangePasswordMachine(nhost.auth.client), [nhost])
  const [current, send] = useMachine(machine)
  const isError = current.matches({ idle: 'error' })
  const isSuccess = current.matches({ idle: 'success' })
  const error = current.context.error
  const isLoading = current.matches('requesting')

  const changePassword = (valuePassword?: string | unknown) =>
    send({
      type: 'REQUEST',
      password: typeof valuePassword === 'string' ? valuePassword : statePassword
    })

  return { changePassword, isLoading, isSuccess, isError, error }
}

export const useResetPassword = (stateEmail?: string, stateOptions?: ResetPasswordOptions) => {
  const nhost = useNhostClient()
  const machine = useMemo(() => createResetPasswordMachine(nhost.auth.client), [nhost])
  const [current, send] = useMachine(machine)
  const isError = current.matches({ idle: 'error' })
  const isSent = current.matches({ idle: 'success' })
  const error = current.context.error
  const isLoading = current.matches('requesting')

  const resetPassword = (valueEmail?: string | unknown, valueOptions = stateOptions) =>
    send({
      type: 'REQUEST',
      email: typeof valueEmail === 'string' ? valueEmail : stateEmail,
      options: valueOptions
    })
  return { resetPassword, isLoading, isSent, isError, error }
}

export const useUserData = () => {
  const service = useAuthInterpreter()
  return useSelector(service, (state) => state.context.user)
}

export const useAvatarUrl = () => {
  const service = useAuthInterpreter()
  return useSelector(service, (state) => state.context.user?.avatarUrl)
}

export const useDefaultRole = () => {
  const service = useAuthInterpreter()
  return useSelector(service, (state) => state.context.user?.defaultRole)
}

export const useDisplayName = () => {
  const service = useAuthInterpreter()
  return useSelector(service, (state) => state.context.user?.displayName)
}

export const useEmail = () => {
  const service = useAuthInterpreter()
  return useSelector(service, (state) => state.context.user?.email)
}

export const useUserId = () => {
  const service = useAuthInterpreter()
  return useSelector(service, (state) => state.context.user?.id)
}

export const useIsAnonymous = () => {
  const service = useAuthInterpreter()
  return useSelector(service, (state) => state.context.user?.isAnonymous)
}

export const useUserLocale = () => {
  const service = useAuthInterpreter()
  return useSelector(service, (state) => state.context.user?.locale)
}

export const useUserRoles = () => {
  const service = useAuthInterpreter()
  return useSelector(service, (state) => state.context.user?.roles || [])
}

export const useSendEmailVerification = (
  stateEmail?: string,
  stateOptions?: SendVerificationEmailOptions
) => {
  const nhost = useNhostClient()
  const machine = useMemo(() => createSendVerificationEmailMachine(nhost.auth.client), [nhost])
  const [current, send] = useMachine(machine)
  const isError = current.matches({ idle: 'error' })
  const isSent = current.matches({ idle: 'success' })
  const error = current.context.error
  const isLoading = current.matches('requesting')

  const sendEmail = (valueEmail?: string | unknown, valueOptions = stateOptions) =>
    send({
      type: 'REQUEST',
      email: typeof valueEmail === 'string' ? valueEmail : stateEmail,
      options: valueOptions
    })
  return { sendEmail, isLoading, isSent, isError, error }
}

export const useConfigMfa = (stateCode?: string) => {
  const nhost = useNhostClient()

  const machine = useMemo(() => createEnableMfaMachine(nhost.auth.client), [nhost])
  const [current, send] = useMachine(machine)

  const isError = useMemo(() => {
    current.matches({ idle: 'error' }) || current.matches({ generated: { idle: 'error' } })
  }, [current])
  const isGenerating = current.matches('generating')
  const isGenerated = current.matches('generated')
  const isActivating = current.matches({ generated: 'activating' })
  const isActivated = current.matches({ generated: 'activated' })
  const error = current.context.error
  const qrCode = current.context.imageUrl || ''

  const generate = () => send('GENERATE')
  const activate = (valueCode?: string | unknown) =>
    send({
      type: 'ACTIVATE',
      activeMfaType: 'totp',
      code: typeof valueCode === 'string' ? valueCode : stateCode
    })
  return {
    generate,
    isGenerating,
    qrCode,
    isGenerated,
    activate,
    isActivating,
    isActivated,
    isError,
    error
  }
}
