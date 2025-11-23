"use client";
import { useRef, useState, useEffect } from "react";
import { useSocket } from "../context/context";

export default function ScreenShare() {
    const { socket, users, name, register } = useSocket();
    const [usernameInput, setUsernameInput] = useState("");
    const [targetId, setTargetId] = useState(null);
    const [sharing, setSharing] = useState(false);

    const pc = useRef(null);
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);

    // Setup Peer Connection
    const setupPC = (id) => {
        if (pc.current) return;

        pc.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        pc.current.ontrack = (event) => {
            remoteVideo.current.srcObject = event.streams[0];
        };

        pc.current.onicecandidate = (e) => {
            if (e.candidate && id) {
                socket.current.emit("candidate", { targetId: id, candidate: e.candidate });
            }
        };
    };

    // Socket Events
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("offer", async ({ from, offer }) => {
            setTargetId(from);
            setupPC(from);

            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).catch(() => null);
            if (stream) {
                localVideo.current.srcObject = stream;
                stream.getTracks().forEach((t) => pc.current.addTrack(t, stream));
            }

            await pc.current.setRemoteDescription(offer);
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);

            socket.current.emit("answer-user", { targetId: from, answer });
        });

        socket.current.on("answer", async ({ answer }) => {
            if (pc.current) await pc.current.setRemoteDescription(answer);
        });

        socket.current.on("candidate", async (candidate) => {
            if (pc.current && candidate) await pc.current.addIceCandidate(candidate);
        });

        return () => {
            socket.current.off("offer");
            socket.current.off("answer");
            socket.current.off("candidate");
        };
    }, [socket.current]);

    // Start screen sharing
    const startShare = async (id) => {
        setTargetId(id);
        setupPC(id);

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            localVideo.current.srcObject = stream;

            stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);

            socket.current.emit("call-user", { targetId: id, offer });
            setSharing(true);
        } catch (err) {
            alert("Screen share permission denied!");
            console.error(err);
        }
    };

    const stopShare = () => {
        localVideo.current?.srcObject?.getTracks().forEach((t) => t.stop());
        pc.current?.close();
        pc.current = null;

        localVideo.current.srcObject = null;
        remoteVideo.current.srcObject = null;
        setSharing(false);
        setTargetId(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            {!name ? (
                <div className="flex flex-col items-center justify-center h-screen space-y-4">
                    <input
                        placeholder="Enter your name"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="px-4 py-2 rounded-md text-black w-64"
                    />
                    <button
                        onClick={() => register(usernameInput)}
                        className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Enter
                    </button>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Users list */}
                    <div className="md:w-1/4 bg-gray-800/50 p-4 rounded-xl shadow-lg flex flex-col">
                        <h2 className="font-semibold text-lg mb-4">Online Users</h2>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
                            {Object.entries(users)
                                .filter(([id]) => id !== socket.current.id)
                                .map(([id, uname]) => (
                                    <div key={id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md hover:bg-gray-600/50">
                                        <span>{uname}</span>
                                        <button
                                            onClick={() => startShare(id)}
                                            disabled={sharing}
                                            className="bg-green-500 px-3 py-1 rounded-md hover:bg-green-600 transition"
                                        >
                                            Share
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Videos */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 flex flex-col bg-gray-800/50 p-2 rounded-xl">
                                <h3 className="text-sm mb-1 text-gray-300">Your Screen</h3>
                                <video ref={localVideo} autoPlay playsInline className="rounded-lg w-full h-60 md:h-80" />
                            </div>

                            <div className="flex-1 flex flex-col bg-gray-800/50 p-2 rounded-xl">
                                <h3 className="text-sm mb-1 text-gray-300">Remote Screen</h3>
                                <video ref={remoteVideo} autoPlay playsInline className="rounded-lg w-full h-60 md:h-80" />
                            </div>
                        </div>

                        {sharing && (
                            <button
                                onClick={stopShare}
                                className="mt-4 w-full bg-red-600 py-2 rounded-md hover:bg-red-700 transition"
                            >
                                Stop Sharing
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
