let mediaRecorder;
let stream;
const preview = document.getElementById('preview');
const videoList = document.getElementById('videoList');
const statusBadge = document.getElementById('recordingStatus');

async function init() {
    try {
        // スマホの背面カメラを優先的に取得
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" }, 
            audio: true 
        });
        preview.srcObject = stream;
    } catch (err) {
        console.error("カメラの起動に失敗:", err);
        alert("カメラの使用を許可してください");
    }
}

document.getElementById('startBtn').onclick = () => {
    const mode = document.getElementById('modeSelect').value;
    const duration = parseInt(document.getElementById('durationInput').value) * 1000;
    const speed = parseFloat(document.getElementById('speedRange').value);

    const options = { mimeType: 'video/webm;codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);
    
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) saveVideo(e.data, speed);
    };

    mediaRecorder.start();
    toggleUI(true);

    if (mode !== 'normal') {
        setTimeout(() => {
            if (mediaRecorder.state === 'recording') stopRecording();
        }, duration);
    }
};

document.getElementById('stopBtn').onclick = stopRecording;

function stopRecording() {
    mediaRecorder.stop();
    toggleUI(false);
}

function toggleUI(isRecording) {
    document.getElementById('startBtn').disabled = isRecording;
    document.getElementById('stopBtn').disabled = !isRecording;
    statusBadge.style.display = isRecording ? 'block' : 'none';
}

function saveVideo(blob, speed) {
    const url = window.URL.createObjectURL(blob);
    const div = document.createElement('div');
    div.className = 'video-item';
    
    const v = document.createElement('video');
    v.src = url;
    v.controls = true;
    v.playbackRate = speed;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `clip_${Date.now()}.webm`;
    a.className = 'hidden-download'; 
    a.style.display = 'none';

    div.appendChild(v);
    div.appendChild(a);
    videoList.prepend(div); // 新しいものを左端に
}

// 一括ダウンロード
document.getElementById('downloadAllBtn').onclick = () => {
    const links = document.querySelectorAll('.hidden-download');
    if(links.length === 0) return alert("保存された動画がありません");
    
    links.forEach((link, index) => {
        setTimeout(() => link.click(), index * 800);
    });
};

// 速度表示更新
document.getElementById('speedRange').oninput = (e) => {
    document.getElementById('speedValue').innerText = e.target.value;
};

init();
