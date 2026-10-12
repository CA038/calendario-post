/**
 * ==========================================================
 * MODAL DE DETALLE, VISOR ADAPTABLE Y FLUJO DE APROBACIÓN
 * Soporte para Videos Reels (9:16), Carruseles (1:1 / 4:5) y Posts
 * ==========================================================
 */

class PostModalManager {
    constructor() {
        this.currentPostId = null;
        this.modalBackdrop = null;
        this.videoElement = null;
        this.currentCarouselIndex = 0;
    }

    init() {
        this.modalBackdrop = document.getElementById('post-detail-modal');
        this.videoElement = document.getElementById('modal-reel-video');
    }

    // Abrir modal con los datos del post
    open(postId, openRejectionForm = false) {
        this.currentPostId = parseInt(postId);
        this.currentCarouselIndex = 0;
        const post = window.dbStore.getPostDetail(this.currentPostId);
        if (!post) return;

        const client = post.client || window.authManager.getActiveClient();

        // Llenar datos en el Modal
        const titleEl = document.getElementById('modal-post-title');
        const scheduleEl = document.getElementById('modal-post-schedule');
        const platformBadgeEl = document.getElementById('modal-platform-badge');
        const statusBadgeEl = document.getElementById('modal-status-badge');
        const obsContentEl = document.getElementById('modal-obs-content');
        const obsBoxEl = document.getElementById('modal-observation-box');
        const captionEl = document.getElementById('modal-caption-text');
        const hashtagsEl = document.getElementById('modal-hashtags-text');
        const mediaContainer = document.getElementById('modal-media-wrapper');
        const feedbackHistoryEl = document.getElementById('modal-feedback-history');
        const rejectionForm = document.getElementById('rejection-form-container');

        if (titleEl) titleEl.textContent = post.title;
        if (scheduleEl) {
            let formattedDate = post.scheduled_date || '';
            if (window.uiRenderer && typeof window.uiRenderer.formatDateOnly === 'function') {
                formattedDate = window.uiRenderer.formatDateOnly(post.scheduled_date);
            }
            scheduleEl.innerHTML = `
                <span>${ICONS.calendar} Programado: <strong>${formattedDate}</strong></span>
            `;
        }
        
        if (platformBadgeEl) {
            const platformText = Array.isArray(post.platform) ? post.platform.join(', ') : (post.platform || 'instagram');
            platformBadgeEl.textContent = `${platformText.toUpperCase()} (${(post.post_type || 'POST').toUpperCase()})`;
        }

        const statusMap = {
            'pending_approval': { label: 'Pendiente de Aprobación', class: 'pending' },
            'approved': { label: '✓ Aprobado por el Cliente', class: 'approved' },
            'changes_requested': { label: 'Con Observaciones', class: 'rejected' },
            'draft': { label: 'Borrador', class: 'draft' }
        };

        const currentStatus = statusMap[post.status] || { label: post.status, class: 'pending' };
        if (statusBadgeEl) {
            statusBadgeEl.textContent = currentStatus.label;
            statusBadgeEl.className = `status-badge-floating ${currentStatus.class}`;
            statusBadgeEl.style.position = 'static';
        }

        // Observaciones de la Agencia
        if (post.observation_internal && obsBoxEl && obsContentEl) {
            obsBoxEl.style.display = 'block';
            obsContentEl.textContent = post.observation_internal;
        } else if (obsBoxEl) {
            obsBoxEl.style.display = 'none';
        }

        // Caption y Hashtags
        if (captionEl) captionEl.textContent = post.caption;
        if (hashtagsEl) hashtagsEl.textContent = post.hashtags || '';

        // Renderizar Vista Previa Multimedia Adaptable (Reel vs Carrusel vs Post Cuadrado)
        if (mediaContainer) {
            this.renderMediaPreview(post, client, mediaContainer);
        }

        // Historial de Feedback
        if (feedbackHistoryEl) {
            if (post.feedback && post.feedback.length > 0) {
                feedbackHistoryEl.innerHTML = `
                    <div class="feedback-history-section">
                        <div class="feedback-history-title">Historial de Observaciones (${post.feedback.length})</div>
                        ${post.feedback.map(f => `
                            <div class="feedback-item">
                                <strong>${f.action_type === 'approved' ? '✓ Aprobado' : '✕ Observación'}:</strong>
                                ${f.rejection_reason ? `<em>[${f.rejection_reason}]</em> - ` : ''}
                                ${f.client_notes || 'Sin comentarios'}
                                <br><small style="color: var(--text-muted);">${f.created_at}</small>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                feedbackHistoryEl.innerHTML = '';
            }
        }

        // Resetear y/o abrir formulario de rechazo
        if (rejectionForm) {
            if (openRejectionForm) {
                rejectionForm.classList.add('active');
            } else {
                rejectionForm.classList.remove('active');
            }
        }

        // Mostrar Modal
        if (this.modalBackdrop) {
            this.modalBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Renderizar Vista Previa según el Tipo de Publicación
    renderMediaPreview(post, client, container) {
        const isReel = post.post_type === 'reel' || post.post_type === 'story';
        const isCarousel = post.post_type === 'carousel';
        const brandColor = client?.brand_color || 'var(--accent)';
        const brandInitials = client?.logo_text || client?.name?.substring(0, 2).toUpperCase() || 'CL';
        const brandName = client?.name || 'Marca';

        // 1. VISTA DE VIDEO REEL / TIKTOK / YOUTUBE SHORTS (9:16 Vertical Phone)
        if (isReel) {
            const rawUrl = post.media?.file_url || 'https://www.w3schools.com/html/mov_bbb.mp4';
            const posterUrl = post.media?.thumbnail_url || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80';
            const parsed = window.mediaHelper ? window.mediaHelper.parseVideoUrl(rawUrl) : null;
            const embedUrl = post.media?.embed_url || (parsed ? parsed.embedUrl : null);
            const isEmbed = (parsed && parsed.type === 'embed') || (embedUrl && !parsed?.isDirectVideo);

            if (isEmbed && embedUrl) {
                container.innerHTML = `
                    <div class="mockup-vertical-phone">
                        <div class="phone-top-notch"></div>
                        <div class="phone-embed-viewport">
                            <iframe 
                                id="modal-reel-iframe" 
                                class="modal-video-iframe" 
                                src="${embedUrl}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowfullscreen>
                            </iframe>
                        </div>
                        <div class="reel-embed-bottom-bar">
                            <span class="reel-embed-badge">${parsed ? `${parsed.icon} ${parsed.providerLabel}` : '🎬 Video Web'}</span>
                            <a href="${rawUrl}" target="_blank" class="btn-reel-external-link" title="Abrir video en su página original">
                                <span>↗ Abrir en origen</span>
                            </a>
                        </div>
                    </div>
                `;
                return;
            }

            // Video Directo HTML5
            container.innerHTML = `
                <div class="mockup-vertical-phone">
                    <div class="phone-top-notch"></div>
                    <video id="modal-reel-video" class="modal-video-element" poster="${posterUrl}" loop playsinline autoplay muted onerror="this.style.display='none'; document.getElementById('reel-fallback-poster').style.display='block';">
                        <source src="${rawUrl}" type="video/mp4">
                    </video>
                    <img id="reel-fallback-poster" src="${posterUrl}" alt="Portada Reel" style="display: none; width: 100%; height: 100%; object-fit: cover;" />
                    <div class="reel-controls-overlay">
                        <button class="reel-ctrl-btn" onclick="window.postModal.togglePlay()">⏯ Pausa/Play</button>
                        <button class="reel-ctrl-btn" onclick="window.postModal.toggleMute()">🔊 Sonido</button>
                    </div>
                </div>
            `;
            return;
        }

        // 2. VISTA DE CARRUSEL (Slider Interactivo con Diapositivas)
        if (isCarousel) {
            const slides = (post.media_items && post.media_items.length > 0) ? post.media_items : [post.media];
            this.currentCarouselIndex = 0;

            container.innerHTML = `
                <div class="mockup-social-card">
                    <div class="social-card-header">
                        <div class="social-header-user">
                            <div class="social-avatar-dot" style="background: ${brandColor}">${brandInitials}</div>
                            <span class="social-username">${brandName}</span>
                        </div>
                        <span class="social-platform-pill">${post.platform} &bull; Carrusel</span>
                    </div>

                    <div class="carousel-viewport-container">
                        <div class="carousel-counter-badge" id="modal-carousel-counter">1 / ${slides.length}</div>
                        
                        ${slides.length > 1 ? `
                            <button class="carousel-nav-arrow prev" onclick="window.postModal.prevCarouselSlide(${slides.length})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button class="carousel-nav-arrow next" onclick="window.postModal.nextCarouselSlide(${slides.length})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        ` : ''}

                        <div class="carousel-slides-track" id="modal-carousel-track">
                            ${slides.map((s, idx) => `
                                <div class="carousel-slide-item">
                                    <img src="${s.file_url || s.thumbnail_url}" alt="Diapositiva ${idx + 1}" />
                                </div>
                            `).join('')}
                        </div>

                        ${slides.length > 1 ? `
                            <div class="carousel-dots-indicator" id="modal-carousel-dots">
                                ${slides.map((_, idx) => `
                                    <div class="carousel-dot ${idx === 0 ? 'active' : ''}" onclick="window.postModal.goToCarouselSlide(${idx}, ${slides.length})"></div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>

                    <div class="social-card-actions">
                        <div class="social-actions-left">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                </div>
            `;
            return;
        }

        // 3. VISTA DE POST CUADRADO / RETRATO (1:1 / 4:5 Sin Recorte)
        const imgUrl = post.media?.file_url || post.media?.thumbnail_url || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800';
        const isPortrait = post.media?.aspect_ratio === '4:5';

        container.innerHTML = `
            <div class="mockup-social-card">
                <div class="social-card-header">
                    <div class="social-header-user">
                        <div class="social-avatar-dot" style="background: ${brandColor}">${brandInitials}</div>
                        <span class="social-username">${brandName}</span>
                    </div>
                    <span class="social-platform-pill">${post.platform}</span>
                </div>

                <div class="social-image-viewport ${isPortrait ? 'portrait' : ''}">
                    <img src="${imgUrl}" alt="${post.title}" class="social-post-img" />
                </div>

                <div class="social-card-actions">
                    <div class="social-actions-left">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                </div>
            </div>
        `;
    }

    // Controles de Carrusel (Siguiente / Anterior / Ir a Diapositiva)
    nextCarouselSlide(totalSlides) {
        if (this.currentCarouselIndex < totalSlides - 1) {
            this.goToCarouselSlide(this.currentCarouselIndex + 1, totalSlides);
        } else {
            this.goToCarouselSlide(0, totalSlides); // Volver al inicio
        }
    }

    prevCarouselSlide(totalSlides) {
        if (this.currentCarouselIndex > 0) {
            this.goToCarouselSlide(this.currentCarouselIndex - 1, totalSlides);
        } else {
            this.goToCarouselSlide(totalSlides - 1, totalSlides); // Ir al final
        }
    }

    goToCarouselSlide(slideIndex, totalSlides) {
        this.currentCarouselIndex = slideIndex;
        const track = document.getElementById('modal-carousel-track');
        const counter = document.getElementById('modal-carousel-counter');
        const dotsContainer = document.getElementById('modal-carousel-dots');

        if (track) {
            track.style.transform = `translateX(-${slideIndex * 100}%)`;
        }
        if (counter) {
            counter.textContent = `${slideIndex + 1} / ${totalSlides}`;
        }
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === slideIndex);
            });
        }
    }

    // Cerrar Modal
    close() {
        if (this.modalBackdrop) {
            this.modalBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
        const video = document.getElementById('modal-reel-video');
        if (video) {
            video.pause();
        }
        this.currentPostId = null;
    }

    // Control de Video Reel
    togglePlay() {
        const video = document.getElementById('modal-reel-video');
        if (video) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    }

    toggleMute() {
        const video = document.getElementById('modal-reel-video');
        if (video) {
            video.muted = !video.muted;
        }
    }

    // Acción de Aprobar
    approveCurrentPost() {
        if (!this.currentPostId) return;
        const success = window.dbStore.approvePost(this.currentPostId, 'Aprobado desde el panel de revisión');
        if (success) {
            window.uiRenderer.showToast('Publicación aprobada con éxito', 'check');
            this.close();
            window.uiRenderer.renderAll();
        }
    }

    // Aprobación rápida desde tarjeta
    quickApprove(postId) {
        const success = window.dbStore.approvePost(postId, 'Aprobación rápida');
        if (success) {
            window.uiRenderer.showToast('Publicación marcada como Aprobada', 'check');
            window.uiRenderer.renderAll();
        }
    }

    // Desplegar formulario de rechazo
    toggleRejectionForm() {
        const form = document.getElementById('rejection-form-container');
        if (form) {
            form.classList.toggle('active');
        }
    }

    // Enviar Rechazo con Motivo Obligatorio
    submitRejection() {
        if (!this.currentPostId) return;

        const reasonSelect = document.getElementById('rejection-reason-select');
        const notesText = document.getElementById('rejection-notes-textarea');

        const reason = reasonSelect ? reasonSelect.value : 'Ajustes solicitados';
        const notes = notesText ? notesText.value.trim() : '';

        if (!notes) {
            alert('Por favor indica detalladamente las observaciones o cambios que necesitas para que el equipo de diseño pueda corregirlo.');
            if (notesText) notesText.focus();
            return;
        }

        const success = window.dbStore.rejectPost(this.currentPostId, reason, notes);
        if (success) {
            window.uiRenderer.showToast('Observaciones enviadas al equipo de la agencia', 'alert');
            if (notesText) notesText.value = '';
            this.close();
            window.uiRenderer.renderAll();
        }
    }

    // Copiar Copy al Portapapeles
    copyCaption() {
        const captionEl = document.getElementById('modal-caption-text');
        const hashtagsEl = document.getElementById('modal-hashtags-text');
        if (captionEl) {
            const textToCopy = `${captionEl.textContent}\n\n${hashtagsEl ? hashtagsEl.textContent : ''}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                window.uiRenderer.showToast('Copy copiado al portapapeles', 'list');
            });
        }
    }

    // Eliminar el post abierto en el modal (Modo Agencia)
    deleteCurrentPost() {
        if (!this.currentPostId) return;
        this.deletePostPrompt(this.currentPostId);
    }

    // Diálogo de confirmación y eliminación de publicación
    deletePostPrompt(postId) {
        const targetId = parseInt(postId);
        const post = window.dbStore.getPostDetail(targetId);
        const titleStr = post ? `"${post.title}"` : 'esta publicación';

        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente ${titleStr} del calendario? Esta acción no se puede deshacer.`)) {
            const deleted = window.dbStore.deletePost(targetId);
            if (deleted) {
                window.uiRenderer.showToast('Publicación eliminada correctamente', 'check');
                this.close();
                window.uiRenderer.renderAll();
            } else {
                window.uiRenderer.showToast('No se pudo eliminar la publicación', 'alert');
            }
        }
    }
}

window.postModal = new PostModalManager();
