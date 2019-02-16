# QuickStart Guide

**KnetMaps** is a web application that uses cytoscapeJS, jQuery and other javascript libraries to visualize network graphs and allow users to interact with them.

All KnetMaps requires is a JSON dataset (in a nested JSON format) as input and it then visualizes it within an embedded container on your web page.

### Getting started with KnetMaps:

Follow the six simple steps below to try out **KnetMaps** out-of-the-box in a static web page:

1. Configure KnetMaps by editing the `config/url_mappings.js` file. This tells KnetMaps how to build links out to external resources. In most situations the defaults provided should be fine.

2. Using NodeJS, install the bundled, optimised KnetMaps distributable via:
```
npm i knetmaps
```
After which you should see the `dist/` subfolder appear, containing further `img/`, `js/`, and `css/` subfolders with the packaged, optimised codebase. 

**Note**: If NPM is not already installed, install it in NodeJS command line interface via:
```
npm install
```

3. In a text editor create a new `index.html` page to load KnetMaps and use it to display a JSON network dataset from the `sampleFiles/` folder. The contents of the web page's `<head>` section should be:
```
<head>
    <link href="css/knetmaps.css" rel="stylesheet" /> <!-- KnetMaps stylesheet -->
    <script src="js/knetmaps-lib.min.js"></script> <!-- KnetMaps dependencies -->
    <script src="js/knetmaps.min.js"></script> <!-- KnetMaps source code -->    
    <script src="sampleFiles/ara2.json"></script> <!-- JSON dataset for static example -->
    <title>KnetMaps.js demo</title>
</head>
```

4. Include **KnetMaps** in your web page's `<body>` as shown below:
```
<body>
    <div id="knet-maps"/>
    <script type="text/javascript">KNETMAPS.KnetMaps().draw('#knet-maps');</script>
</body>
```

**Note:** KnetMaps, by default, uses a percentage of the size of it's parent container, in this case, `<body>` and uses the code in `css/knet-style.css` for various rendering and style attributes.

5. Copy the `js/`, `css/`, and `img/` folders from the `dist/` folder into your web page's root directory.

6. Now, simply open your `index.html` web page in any browser to visualize the network.

**Note:** This example assumes that your network is encoded in two global variables, as per the `sampleFiles/ara2.json` script that was included. If you wish to load the network from elsewhere, you will need to obtain it as a block of Javascript code that defines the two variables, then use `drawRaw()` instead of `draw()` (*both* found in `js_demo/launchNetwork` example code and in `knetmaps/js/..generator.js script` and pass the code block as a second parameter.