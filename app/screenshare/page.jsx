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
    const [sharing, setSharing] = useState(false);
    const [fullscreenVideo, setFullscreenVideo] = useState(null);
    const [targetId, setTargetId] = useState(null);

    const generateName = () => {
        const adjectives = ["Fast", "Smart", "Cool", "Crazy", "Happy"];
        const nouns = ["Tiger", "Lion", "Eagle", "Shark", "Wolf"];
        return (
            adjectives[Math.floor(Math.random() * adjectives.length)] +
            nouns[Math.floor(Math.random() * nouns.length)] +
            Math.floor(Math.random() * 100)
        );
    };

    const logout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
    };

    useEffect(() => {
        socket.current = io({
            transports: ["websocket"],
            // Koi URL nahi likhna — automatically current domain pe connect hoga
        });

        socket.current.on("connect", () => console.log("Socket connected:", socket.current.id));

        let storedUser = localStorage.getItem("user");
        if (!storedUser) {
            const autoName = generateName();
            localStorage.setItem("user", JSON.stringify({ name: autoName }));
            setName(autoName);
            socket.current.emit("register", autoName);
        } else {
            const userObj = JSON.parse(storedUser);
            setName(userObj.name);
            socket.current.emit("register", userObj.name);
        }

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
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-sans p-6">
            {/* Logout Button */}
            <button
                onClick={logout}
                className="absolute top-6 right-6 px-5 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all"
            >
                Logout
            </button>

            <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Private Screen Sharing</h1>

            <div className="text-center mb-8 text-gray-700 font-medium">
                Logged in as <span className="font-bold">{name}</span> | Socket ID: <span className="font-bold">{socket.current?.id}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Users List */}
                {/* Users List */}
                <div className="md:w-1/3 bg-white shadow-xl rounded-2xl p-6">
                    <h3 className="text-xl font-semibold border-b pb-3 mb-5 text-gray-800">Online Users</h3>
                    {Object.entries(users).map(([id, uname]) => {
                        if (socket.current?.id === id) return null;
                        return (
                            <div key={id} className="flex justify-between items-center p-3 mb-3 rounded-xl hover:bg-gray-100 transition">
                                <span className="font-medium">{uname}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startShare(id)}
                                        disabled={sharing}
                                        className="px-4 py-1 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition"
                                    >
                                        screen-Share
                                    </button>
                                    <button
                                        onClick={() => window.location.href = `/screenshare/${uname}`} // redirect to chatroom with user ID
                                        className="px-4 py-1 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
                                    >
                                        Chat
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {Object.keys(users).length === 0 && <div className="text-gray-400 mt-2 text-sm">No other users online</div>}
                </div>


                {/* Video Preview */}
                <div className="md:w-2/3 bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-5">
                    <h3 className="text-xl font-semibold border-b pb-3 mb-4 text-gray-800">Preview</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                        {["local", "remote"].map((v) => {
                            const isFullscreen = fullscreenVideo === v;
                            return (
                                <div
                                    key={v}
                                    className={`flex-1 relative cursor-pointer`}
                                    onClick={() => setFullscreenVideo(isFullscreen ? null : v)}
                                >
                                    <div className="text-sm text-gray-500 mb-1 capitalize">{v}</div>
                                    <video
                                        ref={v === "local" ? localVideo : remoteVideo}
                                        autoPlay
                                        playsInline
                                        className={`w-full rounded-2xl border border-gray-300 shadow-md ${isFullscreen ? "fixed top-0 left-0 w-screen h-screen z-50" : ""}`}
                                    />
                                    {isFullscreen && (
                                        <div
                                            className="absolute top-3 right-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer shadow-lg"
                                            onClick={(e) => { e.stopPropagation(); setFullscreenVideo(null); }}
                                        >
                                            Closee
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {sharing && (
                        <button
                            onClick={stopShare}
                            className="mt-6 px-6 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg transition-all"
                        >
                            Stop Sharing
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}