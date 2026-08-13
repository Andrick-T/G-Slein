import { JitsiMeeting } from "@jitsi/react-sdk";
import {
  AlertTriangle,
  Camera,
  Mic,
  PhoneOff,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";

import Button from "../common/Button.jsx";
import Card from "../common/Card.jsx";
import Spinner from "../common/Spinner.jsx";
import StatusBadge from "../common/StatusBadge.jsx";

const JitsiLoadingSpinner = () => {
  return (
    <div className="flex min-h-[32rem] items-center justify-center gap-3 bg-[#0F172A] text-white">
      <Spinner size="lg" className="text-white" />
      <span className="text-sm font-medium text-white">
        Preparing your consultation...
      </span>
    </div>
  );
};

function ConsultationMeeting({
  domain,
  roomName,
  displayName,
  sessionStatus,
  onLeave,
}) {
  const [externalApi, setExternalApi] = useState(null);
  const [meetingState, setMeetingState] = useState("loading");
  const [deviceError, setDeviceError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    if (!externalApi) {
      return undefined;
    }

    const handleJoined = () => {
      setMeetingState("joined");
      setConnectionError("");
      setParticipantCount(1);
    };

    const handleLeft = () => {
      setMeetingState("left");
      setParticipantCount(0);
    };

    const handleParticipantJoined = () => {
      setParticipantCount((current) => current + 1);
    };

    const handleParticipantLeft = () => {
      setParticipantCount((current) => Math.max(0, current - 1));
    };

    const handleCameraError = () => {
      setDeviceError(
        "Camera access was blocked. Please allow browser camera permission and try again.",
      );
    };

    const handleMicError = () => {
      setDeviceError(
        "Microphone access was blocked. Please allow browser microphone permission and try again.",
      );
    };

    const handleErrorOccurred = (event) => {
      if (event?.type === "CONNECTION" || event?.isFatal) {
        setConnectionError(
          "We're having trouble connecting to the consultation. Check your internet connection and try again.",
        );
      }
    };

    const handleBrowserSupport = (event) => {
      if (event?.supported === false) {
        setConnectionError(
          "This browser does not fully support the Jitsi consultation session.",
        );
      }
    };

    externalApi.addListener("videoConferenceJoined", handleJoined);
    externalApi.addListener("videoConferenceLeft", handleLeft);
    externalApi.addListener("participantJoined", handleParticipantJoined);
    externalApi.addListener("participantLeft", handleParticipantLeft);
    externalApi.addListener("cameraError", handleCameraError);
    externalApi.addListener("micError", handleMicError);
    externalApi.addListener("errorOccurred", handleErrorOccurred);
    externalApi.addListener("browserSupport", handleBrowserSupport);
    externalApi.addListener("readyToClose", handleLeft);

    return () => {
      externalApi.removeListener("videoConferenceJoined", handleJoined);
      externalApi.removeListener("videoConferenceLeft", handleLeft);
      externalApi.removeListener("participantJoined", handleParticipantJoined);
      externalApi.removeListener("participantLeft", handleParticipantLeft);
      externalApi.removeListener("cameraError", handleCameraError);
      externalApi.removeListener("micError", handleMicError);
      externalApi.removeListener("errorOccurred", handleErrorOccurred);
      externalApi.removeListener("browserSupport", handleBrowserSupport);
      externalApi.removeListener("readyToClose", handleLeft);
    };
  }, [externalApi]);

  const connectionLabel =
    meetingState === "joined"
      ? "Connected"
      : meetingState === "left"
        ? "Consultation ended"
        : "Preparing";

  return (
    <Card className="overflow-hidden" padding="none">
      <div className="border-b border-[#E2E8F0] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0D9488]">
              Live consultation room
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F172A]">
              Secure Jitsi meeting
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Use the built-in Jitsi controls for microphone, camera, and
              hangup.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={onLeave}>
            <PhoneOff className="h-4 w-4" />
            Leave consultation workspace
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <StatusBadge status={sessionStatus} />
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
            <Video className="h-3.5 w-3.5" />
            {connectionLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#475569]">
            <Users className="h-3.5 w-3.5" />
            {participantCount > 0 ? participantCount : 1} participant
            {participantCount === 1 || participantCount === 0 ? "" : "s"}
          </span>
        </div>
      </div>

      {deviceError ? (
        <div className="mx-5 mt-5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E] sm:mx-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{deviceError}</span>
          </div>
        </div>
      ) : null}

      {connectionError ? (
        <div className="mx-5 mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626] sm:mx-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{connectionError}</span>
          </div>
        </div>
      ) : null}

      <div className="border-t border-[#E2E8F0] bg-[#0F172A]">
        <div className="min-h-[32rem] w-full">
          <JitsiMeeting
            domain={domain}
            roomName={roomName}
            userInfo={{
              displayName,
            }}
            configOverwrite={{
              prejoinPageEnabled: false,
              enableClosePage: false,
              disableDeepLinking: true,
            }}
            spinner={JitsiLoadingSpinner}
            onApiReady={(api) => {
              setExternalApi(api);
              setMeetingState("ready");
              setDeviceError("");
              setConnectionError("");
            }}
            onReadyToClose={() => {
              setMeetingState("left");
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "32rem";
              iframeRef.style.width = "100%";
              iframeRef.style.border = "0";
            }}
          />
        </div>
      </div>

      <div className="grid gap-3 border-t border-[#E2E8F0] bg-white px-5 py-4 text-sm text-[#64748B] sm:grid-cols-3 sm:px-6">
        <div className="inline-flex items-center gap-2">
          <Mic className="h-4 w-4 text-[#2563EB]" />
          Mute and unmute from Jitsi controls
        </div>
        <div className="inline-flex items-center gap-2">
          <Camera className="h-4 w-4 text-[#2563EB]" />
          Toggle your camera from the meeting toolbar
        </div>
        <div className="inline-flex items-center gap-2">
          <PhoneOff className="h-4 w-4 text-[#2563EB]" />
          Leaving the meeting does not complete the appointment
        </div>
      </div>
    </Card>
  );
}

export default ConsultationMeeting;
