//////////
//theremin div
function getPos(e)
{
    //console.log(e);
    var x = e.pageX - $("#theremin").offset().left;
    var y = e.pageY - $("#theremin").offset().top;
    //var cursor="Your Mouse Position Is : " + x + " and " + y;
    //document.getElementById("theremin").innerHTML=cursor;
}

var ac = new AudioContext();
var rawgain = ac.createGain();
rawgain.gain.value = 0.2; //square wave is too freaking loud.
rawgain.connect(ac.destination);
/*var pn = ac.createPanner();
pn.panningModel = "HRTF";
pn.connect(rawgain);*/
var gn = ac.createGain();
//gn.connect(pn);
gn.connect(rawgain);
gn.gain.value = 0;
var osc = ac.createOscillator();
//osc.type = "square";
osc.type = "sine";
osc.frequency.value = 261.6; //C4
osc.connect(gn);
osc.start();

var pitch_hz = 0;
var cent_stretch = 0; //max of +4800, min of -4800?
var vol_percent = 100;
var x=0;
var y=0;
var x_percent = 1;
var y_percent = 0;
var mouseisdown = 0;
//var gainlock = false;
var max_X;
var max_Y;
var cursor;
document.addEventListener('DOMContentLoaded', function () {
    max_X = Math.max($("#theremin").width(), 1);
    max_Y = Math.max($("#theremin").height(), 1);
    document.body.onmousedown = function()
    {
        mouseisdown += 1;
        mouseisdown = Math.min(1, mouseisdown);
        //console.log("mouse down", mouseisdown);
    };
    document.body.onmouseup = function()
    {
        mouseisdown -= 1;
        mouseisdown = Math.max(0, mouseisdown);
    };
});

function centsFromA0_toPitchInHz(cents)
{
    //actually use A0 = 440 hz as the reference point. That's 4800 cents.
    var cents_from_A4 = cents - 4800;
    var pitch = 440 * (2**(cents_from_A4/1200));
    //f1 * 2^(c/1200) = f2
    //or log_2(f2/f1) * 1200 = cents from f1 to f2
    return pitch;
}

function getPercents(e)
{
    //console.log(mouseisdown);
    if (!mouseisdown)
        return;
    e.preventDefault();
    //tweakPercents(e.pageX, e.pageY);
    tweakPercents(mousePosition.x, mousePosition.y);
    return;
}
function tweakPercents(px, py)
{
    x = px - $("#theremin").offset().left;
    y = py - $("#theremin").offset().top;
    max_X = Math.max($("#theremin").width(), 1);
    max_Y = Math.max($("#theremin").height(), 1);
    x_percent = Math.min(1, Math.max(x,0) / max_X);
    y_percent = Math.min(1, Math.max(y,0) / max_Y);
    cursor="Your Mouse Position Is : " + x_percent + " and " + y_percent;
    document.getElementById("theremin").innerHTML=cursor;
    // update hz and % display
    //cent_stretch = -0.5 + x_percent;
    cent_stretch = x_percent;
    vol_percent = 200*(1-y_percent);
    //$("#pitch")[0].innerText = String(Math.round(cent_stretch * 8700));
    $("#cents")[0].innerText = String(Math.round(cent_stretch * 8700)) + " cents (" + centsToNoteName(cent_stretch*8700) + ")";
    $("#pitch")[0].innerText = String(Math.round(pitch_hz)) + " hz";
    $("#volume")[0].innerText = String(Math.round(vol_percent)) + "%";
    // now update the sound.
    //if (!gainlock)
    gn.gain.value = (1-y_percent);
    //abs.detune.value = cent_stretch*8700 - 5100;
    pitch_hz = centsFromA0_toPitchInHz(cent_stretch*8700);
    osc.frequency.value = pitch_hz;
    return;
}

function playSound(e)
{
    //tweakPercents(e.pageX, e.pageY);
    tweakPercents(mousePosition.x, mousePosition.y);
    e.preventDefault();
    /*
    raw = Uint8Array.from(atob(myin.C5.replace("data:audio/mp3;base64,", "")), c => c.charCodeAt(0));
    ac.close();
    ac = new AudioContext();
    abs = ac.createBufferSource();
    ac.decodeAudioData(raw.slice().buffer, function(buffer) {
        abs.buffer = buffer;
    });
    gn = ac.createGain();
    gn.gain.value = (1-y_percent);
    abs.detune.value = cent_stretch*8700 - 5100;
    //var ab = ac.createBuffer(1, floatsound.length, 44100);
    //abs.buffer = ab;
    abs.connect(gn);
    gn.connect(ac.destination);
    abs.loop = true;
    abs.loopStart = myloopstart;
    abs.loopEnd = myloopend;
    abs.start(0, offset = 0.1);
    gainlock = false;
    */
    //[][][]just play sound
    return;
}
function releaseSound(e)
{
    /*[][][] just set vol to 0
    //console.log("up");
    gainlock = true;
    var stoptime_ms = 500;
    //smooth stop!
    gn.gain.setValueAtTime(gn.gain.value, ac.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + stoptime_ms/1000);
    abs.stop(stoptime_ms/1000);
    //setTimeout(function() {ac.close();}, stoptime_ms);
    //ac.close();
    //gainlock = false;
    */
    gn.gain.value = 0;
    return;
}


var mousePosition = {x:0, y:0};
document.addEventListener('DOMContentLoaded', function () {
    $(document).bind('mousemove',function(mouseMoveEvent){
        mousePosition.x = mouseMoveEvent.pageX;
        mousePosition.y = mouseMoveEvent.pageY;
    });
    //window.addEventListener('keydown', pitchcheck, true);
    //$("#theremin").mousemove(getPos);
    $("#theremin").mousemove(getPercents);
    $("#theremin").mousedown(playSound);
    window.addEventListener('mouseup', releaseSound, true);
    window.addEventListener('keydown', aPlaySound, true);
    window.addEventListener('keyup', aStopSound, true);
    //var x_percent = centblob[0];
    //var y_percent = centblob[1];
    //console.log(x_percent, y_percent);
});
function aPlaySound(key)
{
    if (mouseisdown)
        return;
    //console.log(key.keyCode);
    //don't do anything if an input box is active
    var escapetypes = ["text","textarea","search"];
    if (escapetypes.indexOf(document.activeElement.type) === -1)
    {
        //if (key.keyCode == "65")
        if (key.keyCode >= 65 && key.keyCode <= 90)
            triggerMouseEvent ($("#theremin")[0], "mousedown");
    }
    return;
}
function aStopSound(key)
{
    if (!mouseisdown)
        return;
    //console.log(key.keyCode);
    //don't do anything if an input box is active
    var escapetypes = ["text","textarea","search"];
    if (escapetypes.indexOf(document.activeElement.type) === -1)
    {
        //if (key.keyCode == "65")
        if (key.keyCode >= 65 && key.keyCode <= 90)
            triggerMouseEvent ($("#theremin")[0], "mouseup");
    }
    return;
}
function triggerMouseEvent (node, eventType) {
    var clickEvent = document.createEvent ('MouseEvents');
    clickEvent.initEvent (eventType, true, true);
    node.dispatchEvent (clickEvent);
}

document.addEventListener('DOMContentLoaded', function () {
    drawKeys();
});
function drawKeys()
{
    var ctx=$("#theremin")[0].getContext("2d");
    var width = $("#theremin")[0].width;
    var height = $("#theremin")[0].height;
    var hundwidth = width / 87;
    //console.log(width, height);
    var octavewidth;
    for (var octavewidth = -12*hundwidth; octavewidth < hundwidth*87; octavewidth += hundwidth*12)
    {
        //var lightrat = (octavewidth - (hundwidth*43.5))/(hundwidth*43.5) * 50;
        var lightrat = (octavewidth - (hundwidth*24))/(hundwidth*43.5) * 50;
        lightrat = Math.abs(lightrat);
        lightrat *= 0.5;
        //console.log(lightrat);
        var shifto = -3;
        var coloro = -30;
        ctx.fillStyle = 'hsl('+   (0-coloro) + ', '+ 100 + '%, '+ (50+lightrat) +'%)';
        //ctx.fillRect(Math.round(octavewidth + hundwidth*(1.5-shifto)), 5, Math.round(hundwidth), height - 10);
        ctx.fillRect((octavewidth + hundwidth*(1.5-shifto)), 5, Math.round(hundwidth), height - 10);
        ctx.fillStyle = 'hsl('+  (30-coloro) + ', '+ 100 + '%, '+ (50+lightrat) +'%)';
        ctx.fillRect((octavewidth + hundwidth*(3.5-shifto)), 5, Math.round(hundwidth), height - 10);
        ctx.fillStyle = 'hsl('+ (90-coloro) + ', '+ 100 + '%, '+ (50+lightrat) +'%)';
        ctx.fillRect((octavewidth + hundwidth*(4.5-shifto)), 5, Math.round(hundwidth), height - 10);
        ctx.fillStyle = 'hsl('+ (150-coloro) + ', '+ 100 + '%, '+ (50+lightrat) +'%)';
        ctx.fillRect((octavewidth + hundwidth*(6.5-shifto)), 5, Math.round(hundwidth), height - 10);
        ctx.fillStyle = 'hsl('+ (210-coloro) + ', '+ 100 + '%, '+ (50+lightrat) +'%)';
        ctx.fillRect((octavewidth + hundwidth*(8.5-shifto)), 5, Math.round(hundwidth), height - 10);
        ctx.fillStyle = 'hsl('+ (270-coloro) + ', '+ 100 + '%, '+ (50+lightrat) +'%)';
        ctx.fillRect((octavewidth + hundwidth*(10.5-shifto)), 5, Math.round(hundwidth), height - 10);
        ctx.fillStyle = 'hsl('+ (330-coloro) + ', '+ 100 + '%, '+ (50+lightrat) +'%)';
        ctx.fillRect((octavewidth + hundwidth*(11.5-shifto)), 5, Math.round(hundwidth), height - 10);
    }
    //ctx.fillStyle = 'hsl('+   0 + ', '+ 100 + '%, '+ (85) +'%)';
    //ctx.fillRect(Math.round(hundwidth*-0.5), 5, Math.round(hundwidth), height - 10);
    return;
}

///////////////////
//[][][]controller stuff

var mygp;
var ps3_buttons = {
    "leftstick_x":0,
    "leftstick_y":0,
    "rightstick_x":0,
    "rightstick_y":0,
    "L2":0,
    "R2":0,
    "L2_binary_button":1, //ignore on chrome
    "R2_binary_button":1,
    "X":0,
    "Square":0,
    "Triangle":0,
    "Circle":0,
    "dpad_up":0,
    "dpad_right":0,
    "dpad_down":0,
    "dpad_left":0,
    "L1":0,
    "R1":0,
    "Start":0,
    "Select":0,
    "Home":0,
    "left_stick_click":0,
    "right_stick_click":0,
};
function updateButtons(apad) //this is the default config on firefox.
{
    var axes = apad.axes;
    ps3_buttons["leftstick_x"] = axes[0];
    ps3_buttons["leftstick_y"] = axes[1];
    ps3_buttons["rightstick_x"] = axes[2];
    ps3_buttons["rightstick_y"] = axes[3];
    var buttons = apad.buttons;
    ps3_buttons["L2"] = buttons[6].value;
    ps3_buttons["R2"] = buttons[7].value;
    //extras
    ps3_buttons["X"] = buttons[0].value;
    ps3_buttons["Square"] = buttons[3].value;
    ps3_buttons["Triangle"] = buttons[2].value;
    ps3_buttons["Circle"] = buttons[1].value;
    ps3_buttons["L1"] = buttons[4].value;
    ps3_buttons["R1"] = buttons[5].value;
    ps3_buttons["Select"] = buttons[8].value;
    ps3_buttons["Start"] = buttons[9].value;
    ps3_buttons["Home"] = buttons[10].value;
    ps3_buttons["left_stick_click"] = buttons[11].value;
    ps3_buttons["right_stick_click"] = buttons[12].value;
    ps3_buttons["dpad_up"] = buttons[13].value;
    ps3_buttons["dpad_down"] = buttons[14].value;
    ps3_buttons["dpad_left"] = buttons[15].value;
    ps3_buttons["dpad_right"] = buttons[16].value;
    return;
}
/* //3D!
var rotation = 0;
var azimuth = 0;
function calcRotation()
{
    //There is a problem with the PS3 controller's stick axes, which is it sets the stick value (let's say x) to 1 when it reaches the 45 degree mark. So you can have multiple angles with, say, x=1 y=0.2.
    return (360 + 180/Math.PI * Math.atan2(-1*ps3_buttons["leftstick_y"], ps3_buttons["leftstick_x"])) % 360;
}
function calcAzimuth()
{
    return 90*-1*ps3_buttons["rightstick_y"];
}
function SphericalToCartesian(rotation, azimuth)
{
    //assumes radius 1
    //this is set up so left stick rotates on X/Y from 0 to 360, and right stick controls elevation from -90 to +90.
    var rot = rotation * Math.PI / 180;
    var azi = azimuth * Math.PI / 180;
    var out_x = Math.cos(azi)*Math.cos(rot);
    var out_y = Math.cos(azi)*Math.sin(rot);
    var out_z = Math.sin(azi);
    return [out_x, out_y, out_z];
}
//
var pos_x = 0;
var pos_y = 0;
var pos_z = 0;
*/
function gamepadToTheremin()
{
    //var gamepad_vol = (1+ps3_buttons["R2"]) * (ps3_buttons["R2_binary_button"]);
    var gamepad_vol = 2*ps3_buttons["R2"];
    vol_percent = gamepad_vol;
    //test function: L2 to pitch
    //var gamepad_pitchcents = (1+ps3_buttons["L2"]) * (ps3_buttons["L2_binary_button"]);
    //<>var gamepad_pitchcents = 2*ps3_buttons["L2"];
    var gamepad_pitchcents =
        (Math.round(ps3_buttons["L2"])-1)
        + ps3_buttons["L1"]
        + ps3_buttons["R1"]
        + -1*0.5*0.75*ps3_buttons["leftstick_y"]
        + -1*0.5*0.75*ps3_buttons["rightstick_y"] ;
    //what should be the range? let's try 3200 to 6400, centered at 4800
    //cent_stretch = (3200 + 1600*gamepad_pitchcents)/8700; //that's too fine!
    //<>cent_stretch = (3900 + 850*gamepad_pitchcents)/8700; //borderline playable, but small range.
    cent_stretch = (4800 + 1200*gamepad_pitchcents)/8700; //borderline playable, but small range.
    //
    gn.gain.value = vol_percent;
    pitch_hz = centsFromA0_toPitchInHz(cent_stretch*8700);
    osc.frequency.value = pitch_hz;
    //tweakSound_gamepad();
    /*
    gn.gain.value = (1-y_percent);
    pitch_hz = centsFromA0_toPitchInHz(cent_stretch*8700);
    osc.frequency.value = pitch_hz;
    */
    //releaseSound();
    $("#cents")[0].innerText = String(Math.round(cent_stretch * 8700)) + " cents (" + centsToNoteName(cent_stretch*8700) + ")";
    $("#pitch")[0].innerText = String(Math.round(pitch_hz)) + " hz";
    $("#volume")[0].innerText = String(Math.round(vol_percent*100)) + "%";
    //add 3d!
    //<>rotation = calcRotation();
    //<>azimuth = calcAzimuth();
    //console.log(rotation, azimuth);
    //<>var outto = SphericalToCartesian(rotation, azimuth);
    //<>pos_x = outto[0];
    //<>pos_y = outto[1];
    //<>pos_z = outto[2];
    //console.log(pos_x, pos_y, pos_z);
    //<><><>pn.setPosition(pos_x, pos_y, pos_z); //meh. but kind of works.
    //$("#rotation")[0].innerText = String(rotation) + " degrees counterclockwise from right";
    //$("#azimuth")[0].innerText = String(azimuth) + " degrees up from ground";
    return;
}

var trackingon = false;
var mouseisdown = false;
document.addEventListener('DOMContentLoaded', function () {
    $(window).on("gamepadconnected", function() {
        if (trackingon)
            return;
        else
        {
            mygp = navigator.getGamepads()[0];
            console.log("gamepad connected!");
            setInterval(function() {
                updateButtons(mygp);
                if (!mouseisdown)
                    gamepadToTheremin();
            }, 16);
            trackingon = true;
        }
    });
});

//////
//fancy: look up note name for display
function centsToNoteName(cents)
{
    cents = getAnchorCents(cents);
    return centpitchlookup[cents];
}
function getAnchorCents(cents)
{
    cents = Math.min(cents,8700);
    cents = Math.max(cents,0);
    cents = Math.round(cents/100)*100;
    return cents;
}

var centpitchlookup = 
{
    0:"A0",
    100:"Bb0",
    200:"B0",
    300:"C1",
    400:"Db1",
    500:"D1",
    600:"Eb1",
    700:"E1",
    800:"F1",
    900:"Gb1",
    1000:"G1",
    1100:"Ab1",
    1200:"A1",
    1300:"Bb1",
    1400:"B1",
    1500:"C2",
    1600:"Db2",
    1700:"D2",
    1800:"Eb2",
    1900:"E2",
    2000:"F2",
    2100:"Gb2",
    2200:"G2",
    2300:"Ab2",
    2400:"A2",
    2500:"Bb2",
    2600:"B2",
    2700:"C3",
    2800:"Db3",
    2900:"D3",
    3000:"Eb3",
    3100:"E3",
    3200:"F3",
    3300:"Gb3",
    3400:"G3",
    3500:"Ab3",
    3600:"A3",
    3700:"Bb3",
    3800:"B3",
    3900:"C4",
    4000:"Db4",
    4100:"D4",
    4200:"Eb4",
    4300:"E4",
    4400:"F4",
    4500:"Gb4",
    4600:"G4",
    4700:"Ab4",
    4800:"A4",
    4900:"Bb4",
    5000:"B4",
    5100:"C5",
    5200:"Db5",
    5300:"D5",
    5400:"Eb5",
    5500:"E5",
    5600:"F5",
    5700:"Gb5",
    5800:"G5",
    5900:"Ab5",
    6000:"A5",
    6100:"Bb5",
    6200:"B5",
    6300:"C6",
    6400:"Db6",
    6500:"D6",
    6600:"Eb6",
    6700:"E6",
    6800:"F6",
    6900:"Gb6",
    7000:"G6",
    7100:"Ab6",
    7200:"A6",
    7300:"Bb6",
    7400:"B6",
    7500:"C7",
    7600:"Db7",
    7700:"D7",
    7800:"Eb7",
    7900:"E7",
    8000:"F7",
    8100:"Gb7",
    8200:"G7",
    8300:"Ab7",
    8400:"A7",
    8500:"Bb7",
    8600:"B7",
    8700:"C8",
}