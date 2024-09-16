// Ibex SDK API registry: https://dash.readme.com/api/v1/api-registry/cpd51bloegfhl2
import { AuthenticationError, ApiError, UnexpectedResponseError, CacheUndefinedError, CacheServiceError, IbexClientError } from "./errors"
import { FetchResponse } from "api/dist/core";
import { IbexCredentials } from "./authentication";
import { ICacheService } from "./storage";
import { IbexAuthentication } from "./authentication";
import { InMemoryCache } from "./storage/InMemoryCache";
import SDK, * as types from "./.api/apis/sing-in" // TODO: @sing-in@<uuid>

export type IbexUrl = string & { readonly brand: unique symbol }

class IbexClient {
    readonly ibex: SDK
    readonly authentication: IbexAuthentication

    constructor(
        url: IbexUrl, 
        credentials: IbexCredentials, 
        cache: ICacheService = InMemoryCache()
    ) {
        const ibex = new SDK(url);
        this.ibex = ibex 
        this.authentication = new IbexAuthentication(ibex, credentials, cache)
    }
    
    getAccountTransactions = async (metadata: types.GMetadataParam): Promise<types.GResponse200 | AuthenticationError | ApiError> => {
        return this.authentication.withAuth(() => this.ibex.g(metadata))
            .catch(e => new ApiError(e.status, e.data))
    }

    getTransactionDetails = async (metadata: types.GetTransactionDetails1MetadataParam): Promise<types.GetTransactionDetails1Response200 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.getTransactionDetails1(metadata))
            .catch(e => new ApiError(e.status, e.data))
    }

    createAccount = async (body: types.CreateAccountBodyParam): Promise<types.CreateAccountResponse201 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.createAccount(body))
            .catch(e => new ApiError(e.status, e.data))
    }

    getAccountDetails = async (metadata: types.GetAccountDetailsMetadataParam): Promise<types.GetAccountDetailsResponse200 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.getAccountDetails(metadata))
            .catch(e => new ApiError(e.status, e.data))
    }

    generateBitcoinAddress = async (body: types.GenerateBitcoinAddressBodyParam): Promise<types.GenerateBitcoinAddressResponse201 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.generateBitcoinAddress(body))
            .catch(e => new ApiError(e.status, e.data))
    }

    addInvoice = async (body: types.AddInvoiceBodyParam): Promise<types.AddInvoiceResponse201 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.addInvoice(body))
            .catch(e => new ApiError(e.status, e.data))
    }

    invoiceFromHash = async (metadata: types.InvoiceFromHashMetadataParam): Promise<types.InvoiceFromHashResponse200 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.invoiceFromHash(metadata))
            .catch(e => new ApiError(e.status, e.data))
    }

    // LN fee estimation
    // GetFeeEstimationResponse200 not defined in sdk
    // Returns { amount: integer, invoiceAmount: integer }
    getFeeEstimation = async (metadata: types.GetFeeEstimationMetadataParam): Promise<types.GetFeeEstimationResponse200 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.getFeeEstimation(metadata))
            .catch(e => new ApiError(e.status, e.data))
    }

    payInvoiceV2 = async (body: types.PayInvoiceV2BodyParam): Promise<types.PayInvoiceV2Response200 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.payInvoiceV2(body))
            .catch(e => new ApiError(e.status, e.data))
    }

    sendToAddressV2 = async (body: types.SendToAddressCopyBodyParam): Promise<types.SendToAddressCopyResponse200 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.sendToAddressCopy(body))
            .catch(e => new ApiError(e.status, e.data))
    }

    // onchain fee estimation
    estimateFeeV2 = async (metadata: types.EstimateFeeCopyMetadataParam): Promise<types.EstimateFeeCopyResponse200 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.estimateFeeCopy(metadata))
            .catch(e => new ApiError(e.status, e.data))
    }
    
    createLnurlPay = async (body: types.CreateLnurlPayBodyParam): Promise<types.CreateLnurlPayResponse201 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.createLnurlPay(body))
            .catch(e => new ApiError(e.status, e.data))
    }

    decodeLnurl = async (lnurl: types.DecodeLnurlMetadataParam): Promise<types.DecodeLnurlResponse200 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.decodeLnurl(lnurl))
            .catch(e => new ApiError(e.status, e.data))
    }
    
    payToLnurl = async (body: types.PayToALnurlPayBodyParam): Promise<types.PayToALnurlPayResponse201 | IbexClientError> => {
        return this.authentication.withAuth(() => this.ibex.payToALnurlPay(body))
            .catch(e => new ApiError(e.status, e.data))
    }

    getRate = async (args: types.GetRatesV2MetadataParam): Promise<types.GetRatesV2Response200 | AuthenticationError | ApiError> => {
        return this.authentication.withAuth(() => this.ibex.getRatesV2(args))
            .catch(e => new ApiError(e.status, e.data))
    }
    

}

export default IbexClient
