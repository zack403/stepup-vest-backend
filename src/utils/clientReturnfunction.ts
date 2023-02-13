import { IClientReturnObject } from "src/types/clientReturnObj";

export function clientFeedback(option: IClientReturnObject): IClientReturnObject {
    return {
        status: option.status,
        message: option.message || null,
        data: option.data || null,
        trace: option.trace || null
    }
}
