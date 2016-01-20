import taskActions from "./action/task-actions"
import systemActions from "./action/system-actions"
import {messageActions} from "./action/misc-actions"
import {socket, sendCommandToDefault} from "./socket"
import setIntervals from "./interval"
import appState from "./app-state"
import config from "./config"

export function requestProcessInformation(tasks: TaskInfo[]) {
    console.log("Tasks get")
    taskActions.updateTasks(tasks)
}

export function requestsysteminformation(stats: SystemInfo) {
    console.log("System stats get")
    systemActions.updateStats(stats)
}

export function requestCpuInformation(cpu: CpuInfo) {
    console.log("CPU information get")
    systemActions.updateCPU(cpu)
}

export function requestNetworkInformation(net: NetworkInfo) {
    console.log("Net information get")
    systemActions.updateNet(net)
}

export function killProcess(process: KilledProcessInfo) {
    console.log("Process killed")
    messageActions.processHasBeenKilled(process)
}

export function authentication(info: AuthInfo) {
    if (info.authenticated) {
        setIntervals(socket)
        sendCommandToDefault("requestCpuInformation")
        sendCommandToDefault("requestNetworkInformation")
        appState.authenticated = true
    }
}

export function connectedToUlterius(results: {authRequired: boolean, message: string}) {
    if (results.authRequired) {
        sendCommandToDefault("authenticate", config.auth.password)
        console.log("Okay, lets log in.")
    }
}
