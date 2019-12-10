const BATCH_DRAW_METHOD = 2
let batch = null

function main() {
    var N = 10;
    var lines = generateLines(N);

    // timeCanvas2D(lines, N);
    timeBatchDraw(lines, N);
    console.log('done')
    const canvas = document.getElementById("canvas");
    canvas.onmousemove = (ev) => {

        const screenHeight = canvas.height
        const { offsetX: x, offsetY: y } = ev

        const gl = batch.GL;
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, batch.fbo);
        if (BATCH_DRAW_METHOD == 1) {
            gl.readBuffer(gl.COLOR_ATTACHMENT1);
        }
        gl.readPixels(x, screenHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readPixelBuffer)
        //console.log(readPixelBuffer)
        const [objectID, instanceID] = decodeID(readPixelBuffer)
        if (objectID == 0) {
            readPixelBuffer.set([255, 255, 255, 255]);
            console.log('[Not Selected]')
        }
        else {
            console.log(`Object ID: ${objectID}, Instance ID: ${instanceID}`)
        }
    }
}


function generateLines(N) {
    var lines = new Array(N);
    let canvas = document.getElementById("canvas");
    let w = canvas.width;
    let h = canvas.height;

    // Create funky lines:
    for (i = 0; i < N; i++) {
        lines[i] = {
            fromX: (1.3 * i / N) * w,
            fromY: 0.5 / (2 * (i / N) + 1) * h,
            toX: (0.1 * i - 1) / (N - i) * w,
            toY: (0.3 * N) / (5 * (i * i) / N) * 0.5 * h
        };
    }
    //console.log(lines);
    return lines;
}


function timeBatchDraw(lines, N) {
    let canvas = document.getElementById("canvas");
    let params = {
        maxLines: N,
        clearColor: { r: 1, g: 1, b: 1, a: 1 }
    };
    let batchDrawer = new BatchDrawer(canvas, params);
    batch = batchDrawer

    if (batchDrawer.error != null) {
        console.log(batchDrawer.error);
        return;
    }
    console.time("BatchDraw");
    let id_acc = 1
    for (i = 0; i < N; i++) {
        batchDrawer.addLine(lines[i].fromX, lines[i].fromY, lines[i].toX, lines[i].toY, 3, 1, 0.5, 0.1, 1, id_acc);
        id_acc++;
        batchDrawer.addDot((lines[i].fromX + lines[i].toX) / 2, (lines[i].fromY + lines[i].toY) / 2, 3 * 4, 1, 0, 0, 1, id_acc);
        id_acc++;
    }
    batchDrawer.draw(false);
    console.timeEnd("BatchDraw");

}


function timeCanvas2D(lines, N) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    ctx.lineWidth = 0.01;
    ctx.strokeStyle = '#ffa500';
    ctx.fillStyle = "#FFFFFF";

    console.time("Canvas2D");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (i = 0; i < N; i++) {
        ctx.beginPath();
        ctx.moveTo(lines[i].fromX, lines[i].fromY);
        ctx.lineTo(lines[i].toX, lines[i].toY);
        ctx.stroke();
    }
    console.timeEnd("Canvas2D");
}

const readPixelBuffer = new Uint8Array([0, 255, 255, 255])
const decodeID = (buf) => {
    const objectID = buf[0] | (buf[1] << 8)
    const instanceID = buf[2] | (buf[3] << 8)
    return [objectID, instanceID]
}

