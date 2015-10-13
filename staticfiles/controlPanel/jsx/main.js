var panelElement = document.getElementById('panel');

var MainPanel = React.createClass({displayName: 'MainPanel',

    changePage: function(page){
        this.setState({page: page})
    },

    system: function(func){
        $.ajax({
            url: "systemTask",
            dataType: 'text',
            type: 'POST',
            data:  func,
            success: function(data) {
                console.log("OK");
            }.bind(this),

            error: function(xhr, status, err) {
                console.error("system", status, err.toString());
            }.bind(this)
        });
    },

    getInitialState: function(){

        var defaultPage = "control"; //Pages "control" "config"

        return {
            page: defaultPage,
        };
    },

    render: function(){

        var display;
        var configButtons;

        if (this.state.page == "control") {

            configButtons = React.createElement("button", {className: "configButton", type: "button", onClick: this.changePage.bind(this, "config")})
            display = React.createElement(Outputs, null)

        }
        else if (this.state.page == "config") {

            configButtons =
                            React.createElement("div", null, 
                                React.createElement("button", {className: "applyButton", type: "button", onClick: this.changePage.bind(this, "control")}), 
                                React.createElement("button", {className: "shutdownButton", type: "button", onClick: this.system.bind(this, "shutdown")}), 
                                React.createElement("button", {className: "rebootButton", type: "button", onClick: this.system.bind(this, "reboot")})
                            )

            display = React.createElement(Config, null)

        }

        return (
            React.createElement("div", {className: "panel"}, 
                configButtons, 
                display
            )
        );
    }
});

var Config = React.createClass({displayName: 'Config',

    checkStatus: function(){
        $.ajax({
            url: "getData",
            dataType: 'json',
            cache: false,

            success: function(data) {

                var zoneName = [];
                var zoneServer = [];
                var numZones;

                for (var property in data["zoneName"]){
                    zoneName.push(data["zoneName"][property]);
                }

                for (var property in data["zoneServer"]){
                    zoneServer.push(data["zoneServer"][property]);
                }

                numZones = data["numOutputs"]

                this.setState({zoneName: zoneName});
                this.setState({zoneServer: zoneServer});
                this.setState({numZones: numZones});


            }.bind(this),

            error: function(xhr, status, err) {
                console.error("getData", status, err.toString());
            }.bind(this)

        });
    },

    sendStatus: function(){

        var zoneName = this.state.zoneName;
        var zoneServer = this.state.zoneServer;
        var numZones = this.state.numZones;

        var data = {
            outputs: {},
            servers: {}
        };

        for (var i = 0; i < numZones; i++){
            data.outputs["out"+i] = zoneName[i];
            data.servers["out"+i] = zoneServer[i];
        }

        $.ajax({
            url: "sendNameData",
            dataType: 'text',
            type: 'POST',
            data:  JSON.stringify(data),
            success: function(data) {
                console.log("OK");
            }.bind(this),

            error: function(xhr, status, err) {
                console.error("sendData", status, err.toString());
            }.bind(this)
        });
    },

    componentDidMount: function(){
        this.checkStatus();
    },

    componentWillUnmount: function(){
        this.sendStatus();
    },

    handleZoneName: function(index, event) {

        var zoneName = this.state.zoneName;
        zoneName[index] = event.target.value;
        this.setState({zoneName: zoneName});

    },

    handleZoneServer: function(index, event) {

        var zoneServer = this.state.zoneServer;
        zoneServer[index] = event.target.value;
        this.setState({zoneServer: zoneServer});

    },
    getInitialState: function(){

        var zoneName = [];
        var zoneServer = [];
        var numZones;

        return {
            zoneName: zoneName,
            zoneServer: zoneServer,
            numZones: numZones
        };
    },

    render: function(){

        var config = [];
        var zoneName = this.state.zoneName;
        var zoneServer = this.state.zoneServer;
        var numZones = this.state.numZones;
        var buttonName;

        for (var i = 0; i < numZones; i++ ){

            buttonName = i + 1;

            config.push(
                React.createElement("div", {className: "config", key: 13*i}, 
                    React.createElement("h1", null, buttonName), 
                    React.createElement("input", {type: "text", value: zoneName[i], onChange: this.handleZoneName.bind(this, i)}), 
                    React.createElement("input", {type: "text", value: zoneServer[i], onChange: this.handleZoneServer.bind(this, i)})
                )
            )
        }
        return (
            React.createElement("div", null, 
                config
            )
        );
    }
});

var Outputs = React.createClass({displayName: 'Outputs',

    checkStatus: function(){
        $.ajax({
            url: "getData",
            dataType: 'json',
            cache: false,
            success: function(data) {

                var outs = [];
                var zoneName = [];
                var numZones;

                for (var property in data["outputs"]){
                    outs.push(data["outputs"][property]);
                }

                for (var property in data["zoneName"]){
                    zoneName.push(data["zoneName"][property]);
                }

                numZones = data["numOutputs"];

                this.setState({outs: outs});
                this.setState({zoneName: zoneName});
                this.setState({numZones: numZones});

            }.bind(this),
            error: function(xhr, status, err) {
                console.error("getData", status, err.toString());
            }.bind(this)
        });
    },

    sendStatus: function(out, index){

        clearInterval(this.timer);

        var data = {};
        var outs = [];
        var numZones = this.state.numZones;

        data["state"] = out[index];
        data["out"] = index + 1;

        $.ajax({
            url: "sendOutputData",
            dataType: 'json',
            type: 'POST',
            data:  JSON.stringify(data),
            success: function(data) {
                for (var i = 0; i < numZones; i++){
                    outs[i] = data["outputs"]["out"+i];
                }
                this.setState({outs: outs});

                clearInterval(this.timer);
                this.timer = setInterval(this.tick, 5000);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("sendData", status, err.toString());
            }.bind(this)
        });
    },

    componentDidMount: function(){
        this.checkStatus();
        this.timer = setInterval(this.tick, 5000);
    },

    componentWillUnmount: function(){
        clearInterval(this.timer);
    },

    tick: function(){
        this.checkStatus();
    },

    enableOut: function(index){

        var outs = this.state.outs;
        outs[index] = 1;

        this.setState({outs: outs});
        this.sendStatus(outs, index);
    },

    disableOut: function(index){

        var outs = this.state.outs;
        outs[index] = 0;

        this.setState({outs: outs});
        this.sendStatus(outs, index);
    },

    getInitialState: function(){
        var zoneName = [];
        var outs = [];
        var numZones;

        for (var i = 0; i < numZones; i++ ){
            outs.push(0);
        }
        return {
            outs: outs,
            zoneName: zoneName,
            numZones: numZones
        };
    },

    render: function(){

        var numZones = this.state.numZones;
        var controls = [];

        var ledStatus;
        var button;
        var buttonName;
        var zoneName;

        for (var i = 0; i < numZones; i++ ){

            buttonName = i + 1;
            zoneName = this.state.zoneName[i];

            if (this.state.outs[i] == 0) {
                ledStatus = 'redCircle';
                button = React.createElement("button", {className: "enable", type: "button", onClick: this.enableOut.bind(this, i)}, "Activar");
            }
            else if (this.state.outs[i] == 1) {
                ledStatus = 'greenCircle';
                button = React.createElement("button", {className: "disable", type: "button", onClick: this.disableOut.bind(this, i)}, "Desactivar")
            }

            controls.push(

                React.createElement("div", {className: "output", key: 13*i}, 
                    React.createElement("h2", null, zoneName), 
                    React.createElement("div", {className: ledStatus}), 
                    button
                )
            )
        }

        return (
            React.createElement("div", null, 
                controls
            )
        );
    }
});

React.render(React.createElement(MainPanel, null), panelElement);
