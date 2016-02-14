import React = require("react")
import {settingsStore, SettingsState} from "../store"
import {Input, Button, ButtonGroup} from "react-bootstrap"
import {sendCommandToDefault} from "../socket"
import * as _ from "lodash"

class RadioGroup extends React.Component<{
    label: string, 
    options: string[], 
    default: string, 
    onChange?: (newSelected: string) => any
}, {selected: string}> {
    constructor(props) {
        super(props)
        this.state = ({} as any)
    }
    componentDidMount() {
        this.setState({selected: ""})
    }
    setSelected(option: string) {
        if (this.state.selected !== option) {
            this.setState({selected: option})
            this.props.onChange(option)
        }
    }
    render() {
        //<Button onClick={() => {this.setState({selected: opt})}} active={this.state.selected == opt}>{opt}</Button>
        return <div style={{marginBottom: 10}}>
            <label className="control-label">{this.props.label}</label> <br />
            <ButtonGroup>
                {this.props.options.map((opt, i) => {
                    return <Button bsStyle="primary" key={i} 
                        onClick={() => {this.setSelected(opt)}} 
                        active={this.state.selected == opt || (!this.state.selected && this.props.default == opt) }>
                        {opt}
                    </Button>
                })}
            </ButtonGroup>
        </div>
    }
}

export class SettingsPage extends React.Component<{}, {currentSettings?: SettingsState, newSettings?: {[key: string]: any}}> {
    settingNames = {
        UseWebServer: "Use web server",
        WebServerPort: "Web server port",
        WebFilePath: "Web file path",
        TaskServerPort: "Task server port",
        SkipHostNameResolve: "Skip network hostname resolve",
        VncPort: "VNC server port",
        VncProxyPort: "VNC server proxy port",
        VncPass: "VNC password"
    }
    componentDidMount() {
        this.getSettings(settingsStore.getState())
        this.setState({newSettings: {}})
        settingsStore.listen(this.getSettings)
    }
    componentWillUnmount() {
        settingsStore.unlisten(this.getSettings)
    }
    getSettings = (state: SettingsState) => {
        this.setState({currentSettings: state})
    }
    getEndpoint(property: string) {
        if (property == "UseWebServer") return "changeWebServerUse"
        if (property == "SkipHostNameResolve") return "changeNetworkResolve"
        return "change" + property
    }
    finalizeSettings = () => {
        _.forIn(this.state.newSettings, (v, k) => {
            sendCommandToDefault(this.getEndpoint(k), v)
        })
    }
    render() {
        if (this.state) {
            let page = []
            _.forIn(this.state.currentSettings.settings, (v, k) => {
                if (typeof v === "boolean") {
                    page.push(
                        <RadioGroup 
                            onChange={(val) => {
                                this.setState({newSettings: _.assign(this.state.newSettings, {[k]: (val=="yes")})})
                            }}
                            label={this.settingNames[k]} 
                            default={v?"yes":"no"} 
                            options={["yes", "no"]} />
                    )
                }
                else {
                    page.push(
                        <Input 
                            type="text" 
                            label={this.settingNames[k]} 
                            defaultValue={String(v)}
                            onChange={e => {
                                this.setState({newSettings: _.assign(this.state.newSettings, {[k]: e.target.value})})
                            }}/>
                    )
                }
            })
            return <div>
                {JSON.stringify(this.state)}
                {page}
                <Button onClick={this.finalizeSettings} bsStyle="primary">Save</Button>
            </div>
        }
        else {
            return <div>Loading settings...</div>
        }
        
    }
}