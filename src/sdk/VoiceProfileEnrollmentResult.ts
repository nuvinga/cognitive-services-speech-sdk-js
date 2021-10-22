// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import { CancellationErrorCodePropertyName } from "../common.speech/Exports";
import { Contracts } from "./Contracts";
import {
    CancellationDetailsBase,
    CancellationErrorCode,
    CancellationReason,
    PropertyCollection,
    ResultReason,
} from "./Exports";

export interface EnrollmentResultDetails {
    profileId: string;
    enrollmentsCount: number;
    enrollmentsLengthInSec: number;
    enrollmentsSpeechLengthInSec: number;
    remainingEnrollmentsCount: number;
    remainingEnrollmentsSpeechLengthInSec: number;
    audioLengthInSec: number;
    audioSpeechLengthInSec: number;
    enrollmentStatus: string;
}

/**
 * Output format
 * @class VoiceProfileEnrollmentResult
 */
export class VoiceProfileEnrollmentResult {
    private privReason: ResultReason;
    private privDetails: EnrollmentResultDetails;
    private privProperties: PropertyCollection;
    private privErrorDetails: string;

    public constructor(reason: ResultReason, json: string, statusText: string) {
        this.privReason = reason;
        this.privProperties = new PropertyCollection();
        if (this.privReason !== ResultReason.Canceled) {
            if (!!json) {
                this.privDetails = JSON.parse(json);
                if (this.privDetails.enrollmentStatus.toLowerCase() === "enrolling") {
                    this.privReason = ResultReason.EnrollingVoiceProfile;
                }
            }
        } else {
            this.privErrorDetails = statusText;
            this.privProperties.setProperty(CancellationErrorCodePropertyName, CancellationErrorCode[CancellationErrorCode.ServiceError]);
        }
    }

    public static FromIdentificationProfileList(json: { value: any[] }): VoiceProfileEnrollmentResult[] {
        const results: VoiceProfileEnrollmentResult[] = [];
        for (const item of json.value) {
            const reason: ResultReason = item.enrollmentStatus.toLowerCase() === "enrolling" ?
                ResultReason.EnrollingVoiceProfile : item.enrollmentStatus.toLowerCase() === "enrolled" ?
                ResultReason.EnrolledVoiceProfile : ResultReason.Canceled;
            const result = new VoiceProfileEnrollmentResult(reason, null, null);
            result.privDetails = this.getIdentificationDetails(item);
            results.push(result);
        }
        return results;
    }

    public static FromVerificationProfileList(json: { value: any[] }): VoiceProfileEnrollmentResult[] {
        const results: VoiceProfileEnrollmentResult[] = [];
        for (const item of json.value) {
            const reason: ResultReason = item.enrollmentStatus.toLowerCase() === "enrolling" ?
                ResultReason.EnrollingVoiceProfile : item.enrollmentStatus.toLowerCase() === "enrolled" ?
                ResultReason.EnrolledVoiceProfile : ResultReason.Canceled;
            const result = new VoiceProfileEnrollmentResult(reason, null, null);
            result.privDetails = this.getVerificationDetails(item);
            results.push(result);
        }
        return results;
    }

    public get reason(): ResultReason {
        return this.privReason;
    }

    public get enrollmentsCount(): number {
        return this.privDetails.enrollmentsCount;
    }

    public get enrollmentsLengthInSec(): number {
        return this.privDetails.enrollmentsLengthInSec;
    }

    public get properties(): PropertyCollection {
        return this.privProperties;
    }

    public get enrollmentResultDetails(): EnrollmentResultDetails {
        return this.privDetails;
    }

    public get errorDetails(): string {
        return this.privErrorDetails;
    }

    private static getIdentificationDetails(json: any): any {
        return {
            audioLengthInSec: json.audioLengthInSec ? parseFloat(json.audioLengthInSec) : 0,
            audioSpeechLengthInSec: json.audioSpeechLengthInSec ? parseFloat(json.audioSpeechLengthInSec) : 0,
            enrollmentStatus: json.enrollmentStatus,
            enrollmentsCount: json.enrollmentsCount || 0,
            enrollmentsLengthInSec: json.enrollmentsLengthInSec ? parseFloat(json.enrollmentsLengthInSec) : 0,
            enrollmentsSpeechLengthInSec: json.enrollmentsSpeechLengthInSec ? parseFloat(json.enrollmentsSpeechLengthInSec) : 0,
            profileId: json.profileId || json.identificationProfileId,
            remainingEnrollmentsSpeechLengthInSec: json.remainingEnrollmentsSpeechLengthInSec ? parseFloat(json.remainingEnrollmentsSpeechLengthInSec) : 0
        };
    }

    private static getVerificationDetails(json: any): any {
        return {
            audioLengthInSec: json.audioLengthInSec ? parseFloat(json.audioLengthInSec) : 0,
            audioSpeechLengthInSec: json.audioSpeechLengthInSec ? parseFloat(json.audioSpeechLengthInSec) : 0,
            enrollmentStatus: json.enrollmentStatus,
            enrollmentsCount: json.enrollmentsCount,
            enrollmentsLengthInSec: json.enrollmentsLengthInSec ? parseFloat(json.enrollmentsLengthInSec) : 0,
            enrollmentsSpeechLengthInSec: json.enrollmentsSpeechLengthInSec ? parseFloat(json.enrollmentsSpeechLengthInSec) : 0,
            profileId: json.profileId || json.verificationProfileId,
            remainingEnrollmentsCount: json.remainingEnrollments || json.remainingEnrollmentsCount,
            remainingEnrollmentsSpeechLengthInSec: json.remainingEnrollmentsSpeechLengthInSec ? parseFloat(json.remainingEnrollmentsSpeechLengthInSec) : 0
        };
    }
}

/**
 * @class VoiceProfileEnrollmentCancellationDetails
 */
// tslint:disable-next-line:max-classes-per-file
export class VoiceProfileEnrollmentCancellationDetails extends CancellationDetailsBase {

    private constructor(reason: CancellationReason, errorDetails: string, errorCode: CancellationErrorCode) {
        super(reason, errorDetails, errorCode);
    }

    /**
     * Creates an instance of VoiceProfileEnrollmentCancellationDetails object for the canceled VoiceProfileEnrollmentResult.
     * @member VoiceProfileEnrollmentCancellationDetails.fromResult
     * @function
     * @public
     * @param {VoiceProfileEnrollmentResult} result - The result that was canceled.
     * @returns {VoiceProfileEnrollmentCancellationDetails} The cancellation details object being created.
     */
    public static fromResult(result: VoiceProfileEnrollmentResult): VoiceProfileEnrollmentCancellationDetails {
        const reason = CancellationReason.Error;
        let errorCode: CancellationErrorCode = CancellationErrorCode.NoError;

        if (!!result.properties) {
            errorCode = (CancellationErrorCode as any)[result.properties.getProperty(CancellationErrorCodePropertyName, CancellationErrorCode[CancellationErrorCode.NoError])];
        }

        return new VoiceProfileEnrollmentCancellationDetails(reason, result.errorDetails, errorCode);
    }
}
