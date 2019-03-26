window.onload = function () {

    // Socket.IO
    var socket = io.connect();

    var pathname = window.location.pathname.split("/");
    var canvas_id = pathname[pathname.length - 1];

    function uploadCanvas() {
        socket.emit("update", { id: canvas_id, data_url: canvas.toDataURL() });
    }

    socket.on('connect', function () {
        console.log("Connected to server.");
        socket.emit('join', {id: canvas_id});
    });

    socket.on('message', function (dataURL) {
        var img = new Image(canvas.width, canvas.height);
        img.src = dataURL
        img.onload = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0)
        }
    });

    // Definitions
    var canvas = document.getElementById("paint-canvas");
    var context = canvas.getContext("2d");
    var boundings = canvas.getBoundingClientRect();

    // Specifications
    var mouseX = 0;
    var mouseY = 0;
    context.strokeStyle = 'black'; // initial brush color
    context.lineWidth = 1; // initial brush width
    var isDrawing = false;


    // Handle Colors
    var colors = document.getElementsByClassName('colors')[0];

    colors.addEventListener('click', function (event) {
        context.strokeStyle = event.target.value || 'black';
    });

    // Handle Brushes
    var brushes = document.getElementsByClassName('brushes')[0];

    brushes.addEventListener('click', function (event) {
        context.lineWidth = event.target.value || 1;
    });

    // Mouse Down Event
    canvas.addEventListener('mousedown', function (event) {
        setMouseCoordinates(event);
        isDrawing = true;

        // Start Drawing
        context.beginPath();
        context.moveTo(mouseX, mouseY);
    });

    // Mouse Move Event
    canvas.addEventListener('mousemove', function (event) {
        setMouseCoordinates(event);

        if (isDrawing) {
            context.lineTo(mouseX, mouseY);
            context.stroke();
            uploadCanvas();
        }
    });

    // Mouse Up Event
    canvas.addEventListener('mouseup', function (event) {
        setMouseCoordinates(event);
        isDrawing = false;
    });

    // Handle Mouse Coordinates
    function setMouseCoordinates(event) {
        mouseX = event.clientX - boundings.left;
        mouseY = event.clientY - boundings.top;
    }

    // Handle Clear Button
    var clearButton = document.getElementById('clear');

    clearButton.addEventListener('click', function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        uploadCanvas();
    });

    // Handle Save Button
    var saveButton = document.getElementById('save');

    saveButton.addEventListener('click', function () {
        socket.emit('save', { id: canvas_id, data_url: canvas.toDataURL() });
    });
};