"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function ScreenShare() {
    const socket = useRef(null);
    const pc = useRef(null);
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const localStreamRef = useRef(null);

    const [users, setUsers] = useState({});
    const [name, setName] = useState("");
    const [registered, setRegistered] = useState(false);
    const [targetId, setTargetId] = useState(null);
    const [sharing, setSharing] = useState(false);

    const [fullscreenVideo, setFullscreenVideo] = useState(null); // "local" | "remote" | null

    useEffect(() => {
        socket.current = io("http://localhost:3001", { transports: ["websocket"] });

        socket.current.on("connect", () => console.log("Socket connected:", socket.current.id));
        socket.current.on("users", (list) => setUsers(list || {}));

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

        return () => socket.current.disconnect();
    }, []);

    const ensurePeerConnection = async (forTargetId) => {
        if (pc.current) return;
        pc.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

        pc.current.ontrack = (event) => {
            if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0];
        };

        pc.current.onicecandidate = (e) => {
            if (!e.candidate) return;
            socket.current.emit("candidate", { targetId: forTargetId || targetId, candidate: e.candidate });
        };
    };

    const registerUser = () => {
        if (!name) return alert("Enter your name");
        socket.current.emit("register", name);
        setRegistered(true);
    };

    const startShare = async (id) => {
        setTargetId(id);
        await ensurePeerConnection(id);

        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localStreamRef.current = stream;
        localVideo.current.srcObject = stream;

        stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);

        socket.current.emit("call-user", { targetId: id, offer });
        setSharing(true);
    };

    const stopShare = () => {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;

        if (pc.current) {
            pc.current.getSenders()?.forEach((s) => { try { pc.current.removeTrack(s); } catch { } });
            pc.current.close();
            pc.current = null;
        }

        localVideo.current.srcObject = null;
        remoteVideo.current.srcObject = null;

        setSharing(false);
        setTargetId(null);
        setFullscreenVideo(null);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Private Screen Sharing</h1>

            {!registered ? (
                <div className="flex justify-center gap-4 mb-8">
                    <input
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="px-4 py-2 w-64 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        onClick={registerUser}
                        className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                        Register
                    </button>
                </div>
            ) : (
                <div className="text-center mb-6 text-gray-700 font-medium">
                    Logged in as <span className="font-bold">{name}</span> | Socket ID: <span className="font-bold">{socket.current?.id}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Users List */}
                <div className="md:w-1/3 bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Online Users</h3>
                    {Object.entries(users).map(([id, uname]) => {
                        if (socket.current?.id === id) return null;
                        return (
                            <div key={id} className="flex justify-between items-center p-2 mb-2 rounded hover:bg-gray-50 transition">
                                <span>{uname}</span>
                                <button
                                    onClick={() => startShare(id)}
                                    disabled={sharing}
                                    className="px-3 py-1 rounded bg-green-500 text-white text-sm hover:bg-green-600 transition"
                                >
                                    Share
                                </button>
                            </div>
                        );
                    })}
                    {Object.keys(users).length === 0 && <div className="text-gray-400 mt-2 text-sm">No other users online</div>}
                </div>

                {/* Video Preview */}
                <div className="md:w-2/3 bg-white shadow-md rounded-lg p-4 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4">Preview</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                        {["local", "remote"].map((v) => {
                            const isFullscreen = fullscreenVideo === v;
                            return (
                                <div
                                    key={v}
                                    className={`flex-1 relative cursor-pointer`}
                                    onClick={() => setFullscreenVideo(isFullscreen ? null : v)}
                                >
                                    <div className="text-xs text-gray-500 mb-1 capitalize">{v}</div>
                                    <video
                                        ref={v === "local" ? localVideo : remoteVideo}
                                        autoPlay
                                        playsInline
                                        className={`w-full rounded-md border border-gray-300 ${isFullscreen ? "fixed top-0 left-0 w-screen h-screen z-50" : ""}`}
                                    />
                                    {isFullscreen && (
                                        <div
                                            className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); setFullscreenVideo(null); }}
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
                            className="mt-6 px-5 py-2 rounded-md bg-red-500 text-white font-medium hover:bg-red-600 transition"
                        >
                            Stop Sharing
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
