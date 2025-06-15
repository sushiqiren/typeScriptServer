import type { Request, Response, NextFunction } from "express";
import { respondWithJSON, respondWithError } from "./json.js";
import { BadRequestError } from "./ApiError.js";

interface ChirpRequest {
    body: string;
}

export function handlerChirpValidation(req: Request, res: Response, next: NextFunction): void {
    // let body = "";

    // req.on("data", (chunk) => {
    //     body += chunk;
    // });

    // req.on("end", () => {
    //     try {
    //         const data = JSON.parse(body) as ChirpRequest;
            
    //         if (!data.body || typeof data.body !== "string") {
    //             res.status(400).json({
    //                 error: "Chirp body is required and must be a string"
    //             });
    //             return;
    //         }
            
    //         if (data.body.trim().length === 0) {
    //             res.status(400).json({
    //                 error: "Chirp body cannot be empty"
    //             });
    //             return;
    //         }
            
    //         if (data.body.length > 140) {
    //             res.status(400).json({
    //                 error: "Chirp is too long"
    //             });
    //             return;
    //         }
            
    //         res.status(200).json({
    //             valid: true
    //         });
    //     } catch (error) {
    //         console.error("Error validating chirp:", error);
    //         res.status(500).json({
    //             error: "Something went wrong"
    //         });
    //     }
    try {
        // Access the parsed JSON body directly via req.body
        const data = req.body as ChirpRequest;
        
        if (!data.body || typeof data.body !== "string") {
            respondWithError(res, 400, "Chirp body is required and must be a string");
            return;
        }
        
        if (data.body.trim().length === 0) {
            respondWithError(res, 400, "Chirp body cannot be empty");
            return;
        }
        
        const maxChirpLength = 140;
        if (data.body.length > maxChirpLength) {
            // respondWithError(res, 400, "Chirp is too long");
            // return;
           throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
        }

        const cleanedBody = cleanChirp(data.body);
        
        respondWithJSON(res, 200, {
            cleanedBody: cleanedBody,
        });
    } catch (error) {
        // console.error("Error validating chirp:", error);
        // respondWithError(res, 500, "Something went wrong");
        next(error);
    }  


//     type parameters = {
//         body: string;
//     };

//     let body = "";

//   req.on("data", (chunk) => {
//     body += chunk;
//   });

//   let params: parameters;
//   req.on("end", () => {
//     try {
//       params = JSON.parse(body);
//     } catch (e) {
//       respondWithError(res, 400, "Invalid JSON");
//       return;
//     }
//     const maxChirpLength = 140;
//     if (params.body.length > maxChirpLength) {
//       respondWithError(res, 400, "Chirp is too long");
//       return;
//     }

//     respondWithJSON(res, 200, {
//       valid: true,
//     });
//   });

    function cleanChirp(text: string): string {
        const bannedWords = ['kerfuffle', 'sharbert', 'fornax'];

        // const regex = new RegExp(`\\b(${bannedWords.join('|')})\\b`, 'gi');
        const words = text.split(/\b/);
        const cleanedWords = words.map(word => {
            if (/[a-zA-Z]/.test(word)) {
                const wordLower = word.toLowerCase();
                if (bannedWords.includes(wordLower)) {
                    return '****';
                }
            }
            return word;
        });

        // return text.replace(regex, '****');
        return cleanedWords.join('');
    }
}