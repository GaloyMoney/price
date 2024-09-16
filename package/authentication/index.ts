// import { IbexCredentials } from "./index.types";
import { FetchResponse } from "api/dist/core";
import SDK, * as types from "../.api/apis/sing-in" // TODO: @sing-in@<uuid>
import { AuthStorage, ICacheService } from "../storage";
import { AuthenticationError, ApiError, UnexpectedResponseError, CacheUndefinedError, CacheServiceError, IbexClientError } from "../errors"

export type IbexCredentials = { email: string, password: string }
export class IbexAuthentication {
    readonly ibex: SDK;
    readonly credentials: IbexCredentials;
    readonly storage: AuthStorage;

    constructor(
        sdk: SDK, 
        credentials: IbexCredentials, 
        cache: ICacheService
    ) {
        this.ibex = sdk;
        this.credentials = credentials;
        this.storage = new AuthStorage(cache)
    }
    
    signIn = async (): Promise<void | ApiError> => {
        return this.ibex.signIn(this.credentials)
            .then(_ => _.data)
            .then(_ => this.storeTokens(_))
            .catch(e => new ApiError(e.status, e.data))      
    }

    // wraps Ibex api calls with authentication handling
    withAuth = async <S, T>(apiCall: () => Promise<FetchResponse<S, T>>): Promise<T | AuthenticationError> => {
        const atResp = await this.storage.getAccessToken()

        if (atResp instanceof CacheUndefinedError) {
            const refreshResp = await this.refreshAccessToken()
            if (refreshResp instanceof AuthenticationError) return refreshResp
        } else if (atResp instanceof CacheServiceError) return new AuthenticationError(atResp.message)
        else this.ibex.auth(atResp)

        try {
            return (await apiCall()).data
        } catch (err: any) {
            if (err.status === 401) {
                const refreshResp = await this.refreshAccessToken()
                if (refreshResp instanceof AuthenticationError) return refreshResp
                return (await apiCall()).data
            } else {
                throw err // rethrow non-401s
            }
        }
    }
    
    private refreshAccessToken = async (): Promise<void | AuthenticationError> => {
        const tokenOrErr = await this.storage.getRefreshToken()
        if (tokenOrErr instanceof CacheUndefinedError) {
            return await this.signIn().catch((e: ApiError) => new AuthenticationError(e.message))
        }
        if (tokenOrErr instanceof CacheServiceError) return new AuthenticationError(tokenOrErr.message)
        try {   
            const resp = (await this.ibex.refreshAccessToken({ refreshToken: tokenOrErr })).data
            if (!resp.accessToken) return new UnexpectedResponseError("Access token not found")
            this.storage.setAccessToken(resp.accessToken, resp.expiresAt)
            this.ibex.auth(resp.accessToken)
        } catch (err: any) {
            if (err.status === 401) return await this.signIn().catch((e: ApiError) => new AuthenticationError(e.message))
            else return new AuthenticationError(err)
        }
    }

    // TODO: Divide this into setAccessToken and setRefreshToken which take Partial<SignInResponse200>
    private storeTokens = async (signInResp: types.SignInResponse200): Promise<void> => {
        const { 
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt
        } = signInResp

        if (!accessToken) return Promise.reject(new UnexpectedResponseError("No access token found in response body"))
        await this.storage.setAccessToken(accessToken, accessTokenExpiresAt)
        this.ibex.auth(accessToken)

        if (!refreshToken) return Promise.reject(new UnexpectedResponseError("No refresh token found in response body"))
        await this.storage.setRefreshToken(refreshToken, refreshTokenExpiresAt)
    }
}