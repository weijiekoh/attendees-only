import * as Koa from 'koa';
import * as JsonRpc from '../jsonRpc'
import * as Ajv from 'ajv'
import echoRoute from './echo'
import postQnRoute from './postQn'
import listQnsRoute from './listQns'
import listAnsRoute from './listAns'
import postAnsRoute from './postAns'
import backendStatusRoute from './status'
import { config } from 'ao-config'

interface Route {
    reqValidator: Ajv.ValidateFunction
    route(bodyData: JsonRpc.Request): Promise<JsonRpc.Response> 
}

// Define routes here
const routes = {
    oou_post_qn: postQnRoute,
    oou_list_qns: listQnsRoute,
    oou_post_ans: postAnsRoute,
    oou_list_ans: listAnsRoute,
}

// Dev-only routes for testing
if (config.get('env') !== 'production') {
    routes['test_echo'] = echoRoute
}

// Invoke the route
const handle = async (reqData: JsonRpc.Request) => {
    if (Object.keys(routes).indexOf(reqData.method) === -1) {
        return JsonRpc.genErrorResponse(
            reqData.id, 
            JsonRpc.Errors.methodNotFound.code,
            JsonRpc.Errors.methodNotFound.message,
        )
    }

    try {
        const route = routes[reqData.method]

        // validate the request params
        const validParams = route.reqValidator ? route.reqValidator(reqData.params) : true
        if (validParams) {
            const result = await route.route(reqData.params)

            return JsonRpc.genSuccessResponse(reqData.id, result)

        } else {

            return JsonRpc.genErrorResponse(
                reqData.id, 
                JsonRpc.Errors.invalidParams.code,
                JsonRpc.Errors.invalidParams.message,
            )
        }
    } catch (err) {

        return JsonRpc.genErrorResponse(
            reqData.id,
            err.code,
            err.message,
            err.data,
        )
    }
}

const router = async (
    ctx: Koa.Context,
    _: Function,
) => {
    // Assume that ctx.body is already valid JSON and that it has already been
    // validated in a previous middleware layer
    const reqData = JSON.parse(ctx.request.rawBody)

    let resData

    // Check whether the request is a batch or single request
    if (Array.isArray(reqData)) {
        resData = await Promise.all(
            reqData.map((data: any) => {
                return handle(data)
            })
        )
    } else {
        resData = await handle(reqData)
    }

    ctx.type = 'application/json-rpc'
    ctx.body = resData
}

export { router }
