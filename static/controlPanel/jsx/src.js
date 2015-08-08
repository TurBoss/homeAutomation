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

                for (var property in data["zoneName"]) {
                    zoneName.push(data["zoneName"][property]);
                }

                this.setState({ zoneName: zoneName });
            }).bind(this),

            error: (function (xhr, status, err) {
                console.error("getData", status, err.toString());
            }).bind(this)

        });
    },

    sendStatus: function sendStatus(zoneName) {

        clearInterval(this.timer);

        var data = { outputs: {
                out0: zoneName[0],
                out1: zoneName[1],
                out2: zoneName[2],
                out3: zoneName[3],
                out4: zoneName[4],
                out5: zoneName[5],
                out6: zoneName[6],
                out7: zoneName[7]
            } };
        console.log(data["outputs"]);
        $.ajax({
            url: "sendNameData",
            dataType: 'text',
            type: 'POST',
            data: JSON.stringify(data),
            success: (function (data) {
                for (var i = 0; i < this.state.numOuts; i++) {
                    zoneName[i] = data["outputs"]["out" + i];
                }
                this.setState({ zoneName: zoneName });
            }).bind(this),
            error: (function (xhr, status, err) {
                console.error("sendData", status, err.toString());
            }).bind(this)
        });

        this.timer = setInterval(this.tick, 5000);
    },

    componentDidMount: function componentDidMount() {
        this.checkStatus();
    },

    componentWillUnmount: function componentWillUnmount() {
        this.sendStatus(this.state.zoneName);
    },

    getInitialState: function getInitialState() {

        var zoneName = [];

        return {
            zoneName: zoneName
        };
    },

    handleChange: function handleChange(index, event) {
        var zoneName = this.state.zoneName;
        zoneName[index] = event.target.value;
        this.setState({ zoneName: zoneName });
    },

    render: function render() {

        var numOuts = 8;
        var config = [];
        var zoneName = this.state.zoneName;
        var buttonName;

        for (var i = 0; i < numOuts; i++) {

            buttonName = i + 1;

            config.push(React.createElement(
                "div",
                { className: "config" },
                React.createElement(
                    "h1",
                    null,
                    buttonName
                ),
                React.createElement("input", { type: "text", value: zoneName[i], onChange: this.handleChange.bind(this, i) })
            ));
        }
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
                for (var property in data["outputs"]) {
                    outs.push(data["outputs"][property]);
                }
                this.setState({ outs: outs });

                var zoneName = [];
                for (var property in data["zoneName"]) {
                    zoneName.push(data["zoneName"][property]);
                }
                this.setState({ zoneName: zoneName });
            }).bind(this),
            error: (function (xhr, status, err) {
                console.error("getData", status, err.toString());
            }).bind(this)
        });
    },

    sendStatus: function sendStatus(outs) {

        clearInterval(this.timer);

        var data = { outputs: {
                out0: outs[0],
                out1: outs[1],
                out2: outs[2],
                out3: outs[3],
                out4: outs[4],
                out5: outs[5],
                out6: outs[6],
                out7: outs[7]
            } };

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
        var numOuts = 8;
        for (var i = 0; i < numOuts; i++) {
            outs.push(0);
        }
        return {
            outs: outs,
            zoneName: zoneName,
            numOuts: numOuts
        };
    },

    render: function render() {
        var numOuts = 8;
        var controls = [];

        var ledStatus;
        var button;
        var buttonName;
        var zoneName;

        for (var i = 0; i < numOuts; i++) {

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
                { className: "output" },
                React.createElement(
                    "h1",
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