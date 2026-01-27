import React from 'react';
import './QRCodeModal.css';

const QRCodeModal = ({ qrCodeUrl, shareUrl, onClose }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.download = 'warranty-qr-code.png';
        link.href = qrCodeUrl;
        link.click();
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link. Please copy manually.');
        }
    };

    return (
        <div className="qr-modal-overlay" onClick={onClose}>
            <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="qr-modal-header">
                    <h2>Share Warranty</h2>
                    <button className="qr-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="qr-modal-body">
                    <div className="qr-code-container">
                        <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
                    </div>

                    <p className="qr-instruction">Scan this QR code to view warranty details</p>

                    <div className="share-url-container">
                        <label>Shareable Link:</label>
                        <div className="share-url-input-group">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="share-url-input"
                            />
                            <button onClick={handleCopyLink} className="copy-btn">
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>

                <div className="qr-modal-footer">
                    <button onClick={handleDownload} className="download-btn">
                        Download QR Code
                    </button>
                    <button onClick={onClose} className="close-btn">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;
