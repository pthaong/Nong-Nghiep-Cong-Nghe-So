body {
    margin: 0;
    background: #0b120d;
    color: #f1f3eb;
    font-family: "Segoe UI", sans-serif;
}

.notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #101a12;
    border-bottom: 1px solid #29362a;
    padding: 24px 28px;
}

.notification-header h1 {
    margin: 0;
    font-size: 30px;
    font-weight: 700;
}

.notification-header p {
    margin: 6px 0 0;
    color: #a7b9a5;
    font-size: 14px;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.back-home {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: #dfe8dc;
    background: rgba(255,255,255,0.04);
    border: 1px solid #324333;
    border-radius: 10px;
    padding: 8px 12px;
}

.notification-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px 20px 48px;
}

.summary-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 22px;
}

.summary-card {
    background: #131d15;
    border: 1px solid #29362a;
    border-radius: 16px;
    padding: 18px 20px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.summary-card strong {
    display: block;
    margin-top: 8px;
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
}

.summary-label {
    color: #a7b9a5;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.summary-card-total strong { color: #eaf7ef; }
.summary-card-warning strong { color: #ffbf69; }
.summary-card-success strong { color: #61db8f; }

.filter-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
}

.filter-btn {
    border: 1px solid #324333;
    background: transparent;
    color: #eaf7ef;
    padding: 9px 16px;
    border-radius: 999px;
    font-size: 13px;
    cursor: pointer;
}

.filter-btn.active {
    background: #1f8f5d;
    border-color: #1f8f5d;
}

.notification-panel {
    background: #131d15;
    border: 1px solid #29362a;
    border-radius: 18px;
    padding: 18px;
}

.notification-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.notification-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 14px;
    align-items: center;
    background: #18241a;
    border: 1px solid #2d3a2d;
    border-radius: 14px;
    padding: 16px 16px;
}

.notification-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: rgba(33, 164, 91, 0.12);
    color: #72d8a2;
}

.notification-item.unread .notification-icon {
    background: rgba(255, 191, 105, 0.12);
    color: #ffbf69;
}

.notification-content {
    min-width: 0;
}

.notification-content h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
}

.notification-content p {
    margin: 0 0 8px;
    color: #c5d1c3;
    line-height: 1.6;
    font-size: 14px;
}

.notification-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: #8f9c8d;
    font-size: 11px;
}

.notification-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.notification-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid #324333;
}

.notification-pill.unread {
    background: rgba(255, 191, 105, 0.12);
    color: #ffbf69;
}

.notification-pill.read {
    background: rgba(33, 164, 91, 0.12);
    color: #72d8a2;
}

.notification-item button {
    border: 1px solid #324333;
    background: transparent;
    color: #eaf7ef;
    border-radius: 10px;
    padding: 7px 10px;
    cursor: pointer;
}

.notification-item button.delete-btn {
    color: #ff8a80;
    border-color: rgba(255, 138, 128, 0.5);
}

.notification-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    border-radius: 12px;
    border: 1px dashed #435741;
    color: #cad6cc;
    background: rgba(255,255,255,0.02);
}

.hidden {
    display: none;
}

@media (max-width: 768px) {
    .notification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 14px;
    }

    .summary-row {
        grid-template-columns: 1fr;
    }

    .notification-item {
        grid-template-columns: auto 1fr;
    }

    .notification-actions {
        grid-column: 2 / 3;
        justify-content: flex-end;
    }
}

