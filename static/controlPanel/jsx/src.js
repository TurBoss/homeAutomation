"use strict";

var MainPanel = React.createClass({
    displayName: "MainPanel",

    changePage: function changePage(page) {
        this.setState({ page: page });
    },

    getInitialState: function getInitialState() {

        var defaultPage = "control"; //Pages "control" "config"

        return {
            page: defaultPage
        };
    },

    render: function render() {

        var display;
        var configButton;

        if (this.state.page == "control") {
            configButton = React.createElement("button", { className: "configButton", type: "button", onClick: this.changePage.bind(this, "config") });
            display = React.createElement(Outputs, null);
        } else if (this.state.page == "config") {
            configButton = React.createElement("button", { className: "configButton", type: "button", onClick: this.changePage.bind(this, "control") });
            display = React.createElement(Config, null);
        }

        return React.createElement(
            "div",
            { className: "panel" },
            configButton,
            display
        );
    }
});

var Config = React.createClass({
    displayName: "Config",

    checkStatus: function checkStatus() {
        $.ajax({
            url: "getData",
            dataType: 'json',
            cache: false,

            success: (function (data) {

                var zoneName = [];
                var portName;
                var numZones;

                for (var property in data["zoneName"]) {
                    zoneName.push(data["zoneName"][property]);
                }

                portName = data["portName"];
                numZones = data["numOutputs"];

                this.setState({ zoneName: zoneName });
                this.setState({ portName: portName });
                this.setState({ numZones: numZones });
            }).bind(this),

            error: (function (xhr, status, err) {
                console.error("getData", status, err.toString());
            }).bind(this)

        });
    },

    sendStatus: function sendStatus(zoneName, portName) {

        var data = {
            outputs: {
                out0: zoneName[0],
                out1: zoneName[1],
                out2: zoneName[2],
                out3: zoneName[3],
                out4: zoneName[4],
                out5: zoneName[5],
                out6: zoneName[6],
                out7: zoneName[7]
            },
            portName: portName
        };

        $.ajax({
            url: "sendNameData",
            dataType: 'text',
            type: 'POST',
            data: JSON.stringify(data),
            success: (function (data) {
                console.log("OK");
            }).bind(this),

            error: (function (xhr, status, err) {
                console.error("sendData", status, err.toString());
            }).bind(this)
        });
    },

    componentDidMount: function componentDidMount() {
        this.checkStatus();
    },

    componentWillUnmount: function componentWillUnmount() {
        this.sendStatus(this.state.zoneName, this.state.portName);
    },

    getInitialState: function getInitialState() {

        var zoneName = [];
        var portName;
        var numZones;

        return {
            zoneName: zoneName,
            portName: portName,
            numZones: numZones
        };
    },

    handleChange: function handleChange(index, event) {
        if (index == "port") {
            var portName = this.state.portName;
            portName = event.target.value;
            this.setState({ portName: portName });
        } else {

            var zoneName = this.state.zoneName;
            zoneName[index] = event.target.value;
            this.setState({ zoneName: zoneName });
        }
    },

    render: function render() {

        var config = [];
        var zoneName = this.state.zoneName;
        var portName = this.state.portName;
        var numZones = this.state.numZones;
        var buttonName;

        for (var i = 0; i < numZones; i++) {

            buttonName = i + 1;

            config.push(React.createElement(
                "div",
                { className: "config", key: 13 * i },
                React.createElement(
                    "h1",
                    null,
                    buttonName
                ),
                React.createElement("input", { type: "text", value: zoneName[i], onChange: this.handleChange.bind(this, i) })
            ));
        }
        config.push(React.createElement(
            "div",
            { className: "config", key: "0123" },
            React.createElement(
                "h1",
                null,
                "Port"
            ),
            React.createElement("input", { type: "text", value: portName, onChange: this.handleChange.bind(this, "port") })
        ));
        return React.createElement(
            "div",
            null,
            config
        );
    }
});

var Outputs = React.createClass({
    displayName: "Outputs",

    checkStatus: function checkStatus() {
        $.ajax({
            url: "getData",
            dataType: 'json',
            cache: false,
            success: (function (data) {

                var outs = [];
                var zoneName = [];
                var numZones;

                for (var property in data["outputs"]) {
                    outs.push(data["outputs"][property]);
                }

                for (var property in data["zoneName"]) {
                    zoneName.push(data["zoneName"][property]);
                }

                numZones = data["numOutputs"];

                this.setState({ outs: outs });
                this.setState({ zoneName: zoneName });
                this.setState({ numZones: numZones });
            }).bind(this),
            error: (function (xhr, status, err) {
                console.error("getData", status, err.toString());
            }).bind(this)
        });
    },

    sendStatus: function sendStatus(outs) {

        clearInterval(this.timer);

        var data = {
            outputs: {
                out0: outs[0],
                out1: outs[1],
                out2: outs[2],
                out3: outs[3],
                out4: outs[4],
                out5: outs[5],
                out6: outs[6],
                out7: outs[7]
            }
        };

        $.ajax({
            url: "sendOutputData",
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(data),
            success: (function (data) {
                for (var i = 0; i < this.state.numOuts; i++) {
                    outs[i] = data["outputs"]["out" + i];
                }
                this.setState({ outs: outs });
            }).bind(this),
            error: (function (xhr, status, err) {
                console.error("sendData", status, err.toString());
            }).bind(this)
        });

        this.timer = setInterval(this.tick, 5000);
    },

    componentDidMount: function componentDidMount() {
        this.checkStatus();
        this.timer = setInterval(this.tick, 5000);
    },

    componentWillUnmount: function componentWillUnmount() {
        clearInterval(this.timer);
    },

    tick: function tick() {
        this.checkStatus();
    },

    enableOut: function enableOut(index) {

        var outs = this.state.outs;
        outs[index] = 1;

        this.sendStatus(outs);

        this.setState({ outs: outs });
    },

    disableOut: function disableOut(index) {

        var outs = this.state.outs;
        outs[index] = 0;

        this.sendStatus(outs);

        this.setState({ outs: outs });
    },

    getInitialState: function getInitialState() {
        var zoneName = [];
        var outs = [];
        var numZones;

        for (var i = 0; i < numZones; i++) {
            outs.push(0);
        }
        return {
            outs: outs,
            zoneName: zoneName,
            numZones: numZones
        };
    },

    render: function render() {

        var numZones = this.state.numZones;
        var controls = [];

        var ledStatus;
        var button;
        var buttonName;
        var zoneName;

        for (var i = 0; i < numZones; i++) {

            buttonName = i + 1;
            zoneName = this.state.zoneName[i];

            if (this.state.outs[i] == 0) {
                ledStatus = 'redCircle';
                button = React.createElement(
                    "button",
                    { className: "enable", type: "button", onClick: this.enableOut.bind(this, i) },
                    "Activar"
                );
            } else if (this.state.outs[i] == 1) {
                ledStatus = 'greenCircle';
                button = React.createElement(
                    "button",
                    { className: "disable", type: "button", onClick: this.disableOut.bind(this, i) },
                    "Desactivar"
                );
            }

            controls.push(React.createElement(
                "div",
                { className: "output", key: 13 * i },
                React.createElement(
                    "h2",
                    null,
                    zoneName
                ),
                React.createElement("div", { className: ledStatus }),
                button
            ));
        }

        return React.createElement(
            "div",
            null,
            controls
        );
    }
});

React.render(React.createElement(MainPanel, null), document.getElementById('panel'));
//# sourceMappingURL=/home/jauria/Proyectos/homeAutomation/static/controlPanel/jsx/src.js.map