"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/context";

export default function ScreenShare() {
    const { name, users, messages, socket, sendMessage } = useUser();
    const router = useRouter();

    const pc = useRef(null);
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const localStreamRef = useRef(null);

    const [sharing, setSharing] = useState(false);
    const [fullscreenVideo, setFullscreenVideo] = useState(null);
    const [targetId, setTargetId] = useState(null);
    const [input, setInput] = useState("");

    const messagesEndRef = useRef(null);
    const scrollToBottom = () =>
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(scrollToBottom, [messages]);

    // Detect if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // WebRTC Setup
    const ensurePeerConnection = async (forTargetId) => {
        if (pc.current) return;
        pc.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        pc.current.ontrack = (event) => {
            if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0];
        };

        pc.current.onicecandidate = (e) => {
            if (!e.candidate) return;
            socket.current.emit("candidate", {
                targetId: forTargetId || targetId,
                candidate: e.candidate,
            });
        };
    };

    // Socket Event Listeners
    useEffect(() => {
        if (!socket.current) return;

        socket.current.on("offer", async ({ from, offer }) => {
            setTargetId(from);
            await ensurePeerConnection(from);
            await pc.current.setRemoteDescription(offer);
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socket.current.emit("answer-user", { targetId: from, answer });
        });

        socket.current.on("answer", async ({ answer }) => {
            if (!pc.current) return;
            await pc.current.setRemoteDescription(answer);
        });

        socket.current.on("candidate", async (candidate) => {
            if (!pc.current || !candidate) return;
            await pc.current.addIceCandidate(candidate);
        });

        return () => {
            socket.current.off("offer");
            socket.current.off("answer");
            socket.current.off("candidate");
        };
    }, [socket.current]);

    // Start Sharing (Screen on PC, Camera on Mobile)
    const startShare = async (id) => {
        setTargetId(id);
        await ensurePeerConnection(id);

        let stream;
        try {
            stream = await (isMobile
                ? navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                : navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }));
        } catch (err) {
            console.error("Media Error:", err);
            alert("Could not access screen/camera");
            return;
        }

        localStreamRef.current = stream;
        localVideo.current.srcObject = stream;

        stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);

        socket.current.emit("call-user", { targetId: id, offer });
        setSharing(true);
    };

    // Stop Sharing
    const stopShare = () => {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;

        if (pc.current) {
            pc.current.getSenders()?.forEach((s) => pc.current.removeTrack(s));
            pc.current.close();
            pc.current = null;
        }

        localVideo.current.srcObject = null;
        remoteVideo.current.srcObject = null;

        setSharing(false);
        setTargetId(null);
        setFullscreenVideo(null);
    };

    const handleKey = (e) => {
        if (e.key === "Enter") sendMsg();
    };

    const sendMsg = () => {
        if (!input.trim()) return;
        sendMessage({ text: input, from: name, to: targetId || "all" });
        setInput("");
    };

    return (
        <div className="min-h-screen mt-12 p-4 md:p-8 bg-gradient-to-r from-purple-300 via-pink-200 to-yellow-200 animate-gradient-x">
            <h1 className="text-4xl font-bold text-center mb-6">Screen Sharing & Chat</h1>

            <div className="text-center mb-6">
                Logged in as <span className="font-bold">{name}</span> | Socket ID:{" "}
                <span className="font-bold">{socket.current?.id}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Users List */}
                <div className="md:w-1/3 bg-white p-4 rounded-2xl shadow-lg">
                    <h3 className="font-semibold text-lg mb-4 border-b pb-2">Online Users</h3>

                    {Object.entries(users).map(([id, uname]) => {
                        if (socket.current?.id === id) return null;
                        return (
                            <div
                                key={id}
                                className="flex justify-between items-center mb-2 p-2 rounded-xl hover:bg-indigo-50 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                                    <span>{uname}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startShare(id)}
                                        disabled={sharing}
                                        className="px-3 py-1 rounded-full bg-green-500 text-white text-sm hover:bg-green-600 transition"
                                    >
                                        {isMobile ? "Use Camera" : "Share"}
                                    </button>
                                    <button
                                        onClick={() => router.push(`/screenshare/${uname}`)}
                                        className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600 transition"
                                    >
                                        Chat
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {Object.keys(users).length === 0 && (
                        <div className="text-gray-400 mt-2 text-sm">No other users online</div>
                    )}
                </div>

                {/* Video & Chat */}
                <div className="md:w-2/3 bg-white p-4 rounded-2xl shadow-lg flex flex-col gap-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Preview</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                        {["local", "remote"].map((v) => {
                            const isFull = fullscreenVideo === v;
                            return (
                                <div
                                    key={v}
                                    className="flex-1 relative cursor-pointer"
                                    onClick={() => setFullscreenVideo(isFull ? null : v)}
                                >
                                    <div className="text-sm text-gray-500 mb-1 capitalize">{v}</div>
                                    <video
                                        ref={v === "local" ? localVideo : remoteVideo}
                                        autoPlay
                                        playsInline
                                        muted={v === "local"} // important for mobile autoplay
                                        className={`w-full rounded-2xl border shadow-md ${isFull ? "fixed top-0 left-0 w-screen h-screen z-50" : ""
                                            }`}
                                    />
                                    {isFull && (
                                        <div
                                            className="absolute top-3 right-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer shadow-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFullscreenVideo(null);
                                            }}
                                        >
                                            Close
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {sharing && (
                        <button
                            onClick={stopShare}
                            className="mt-4 px-6 py-2 rounded-2xl bg-red-500 text-white hover:bg-red-600 font-bold shadow-md"
                        >
                            Stop Sharing
                        </button>
                    )}

                    {/* Chat Section */}
                    <div className="flex-1 flex flex-col border-t pt-2 mt-2">
                        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 bg-gray-50 rounded-lg">
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded-2xl max-w-[70%] break-words ${m.from === name
                                        ? "bg-blue-500 text-white self-end"
                                        : "bg-gray-300 text-gray-800 self-start"
                                        }`}
                                >
                                    <div className="text-xs font-semibold mb-1">{m.from}</div>
                                    <div>{m.text}</div>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                onClick={sendMsg}
                                className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
