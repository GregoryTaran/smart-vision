// js/vision-call.js
import { collection, getDocs, doc, setDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export async function setupVisionCalls({ db, auth, usersList, audio, log }) {
  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
  let pc, localStream;
  const currentUserEmail = auth.currentUser.email;

  const logMsg = msg => {
    log(msg);
    console.log(msg);
  };

  async function initPeer() {
    pc = new RTCPeerConnection(servers);
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    pc.ontrack = e => {
      audio.srcObject = e.streams[0];
      logMsg("🎧 Получен аудиопоток");
    };
    return pc;
  }

  async function loadUsers() {
    const querySnapshot = await getDocs(collection(db, "users"));
    usersList.innerHTML = "";
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.email && data.email !== currentUserEmail) {
        const div = document.createElement("div");
        div.className = "user-block";
        div.innerHTML = `
          <span>${data.email}</span>
          <button>📞 Позвонить</button>
        `;
        div.querySelector("button").onclick = () => callUser(data.email);
        usersList.appendChild(div);
      }
    });
  }

  async function callUser(emailTo) {
    logMsg("🚀 Инициализация звонка...");
    const pc = await initPeer();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const callRef = doc(collection(db, "calls"));
    await setDoc(callRef, { from: currentUserEmail, to: emailTo, offer });
    logMsg(`📨 Звонок отправлен: ${emailTo}`);

    onSnapshot(callRef, async snap => {
      const data = snap.data();
      if (data?.answer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(data.answer);
        logMsg("✅ Соединение установлено");
      }
    });
  }

  async function listenIncoming() {
    const callsRef = collection(db, "calls");
    onSnapshot(callsRef, async snapshot => {
      for (const change of snapshot.docChanges()) {
        const data = change.doc.data();
        if (data.to === currentUserEmail && data.offer && !data.answer) {
          logMsg(`📞 Входящий звонок от ${data.from}`);
          const pc = await initPeer();
          await pc.setRemoteDescription(data.offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await updateDoc(change.doc.ref, { answer });
          logMsg("📡 Ответ отправлен");
        }
      }
    });
  }

  await loadUsers();
  await listenIncoming();
  logMsg("🔗 Готов к звонкам");
}
