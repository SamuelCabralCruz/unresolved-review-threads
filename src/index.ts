import * as core from '@actions/core'
import {handleEvent} from "@/src/handler";

async function main() {
    try {
        await handleEvent()
    } catch (error) {
        console.log('Unexpected Error')
        core.error(error)
        core.setFailed(error.message);
    }
}

main()
