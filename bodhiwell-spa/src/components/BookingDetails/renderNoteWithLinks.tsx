import React from "react";

export const renderNoteWithLinks = (text: string) => {
        const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;

        return text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                let cleanPart = part;
                const punctuation = /[.,;:?!)]+$/;
                const match = part.match(punctuation);
                let textSuffix = '';

                if (match) {
                    cleanPart = part.substring(0, match.index);
                    textSuffix = part.substring(match.index!);
                }

                const href = cleanPart.startsWith('www.') ? `https://${cleanPart}` : cleanPart;

                return (
                    <React.Fragment key={index}>
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#007bff', textDecoration: 'underline' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {cleanPart}
                        </a>
                        {textSuffix}
                    </React.Fragment>
                );
            }
            return part;
        });
};