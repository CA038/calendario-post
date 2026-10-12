/**
 * ==========================================================
 * CREADOR DE POSTS Y REELS (MODO AGENCIA)
 * Soporte para:
 * 1. Carga directa de fotos y videos (Drag & Drop)
 * 2. Carga mediante Enlace Web de cualquier página:
 *    - YouTube Shorts y Videos
 *    - TikTok Reels
 *    - Instagram Reels
 *    - Google Drive (videos compartidos)
 *    - Vimeo, Loom
 *    - Enlaces directos .mp4, .webm, .mov
 *    - Cualquier página web con contenido multimedia
 * ==========================================================
 */

// Helper global para análisis y detección de URLs multimedia
window.mediaHelper = {
    parseVideoUrl(url) {
        if (!url || typeof url !== 'string') return null;
        url = url.trim();
        if (!url) return null;

        // 1. YouTube Shorts y Videos estándar
        const ytShortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
        const ytWatchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/i);
        if (ytShortsMatch || ytWatchMatch) {
            const videoId = (ytShortsMatch ? ytShortsMatch[1] : ytWatchMatch[1]);
            const isShort = !!ytShortsMatch;
            return {
                type: 'embed',
                provider: 'youtube',
                providerLabel: isShort ? 'YouTube Shorts' : 'YouTube Video',
                icon: '▶️',
                originalUrl: url,
                embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&playsinline=1`,
                thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                isDirectVideo: false
            };
        }

        // 2. TikTok
        const tiktokMatch = url.match(/tiktok\.com\/(?:@[^/]+\/video\/|v\/|embed\/v2\/)(\d+)/i);
        if (tiktokMatch) {
            const videoId = tiktokMatch[1];
            return {
                type: 'embed',
                provider: 'tiktok',
                providerLabel: 'TikTok Reel',
                icon: '📱',
                originalUrl: url,
                embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
                thumbnailUrl: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop&q=80',
                isDirectVideo: false
            };
        }

        // 3. Instagram Reel / Post
        const instaMatch = url.match(/instagram\.com\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/i);
        if (instaMatch) {
            const code = instaMatch[1];
            return {
                type: 'embed',
                provider: 'instagram',
                providerLabel: 'Instagram Reel',
                icon: '📸',
                originalUrl: url,
                embedUrl: `https://www.instagram.com/reel/${code}/embed/`,
                thumbnailUrl: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&auto=format&fit=crop&q=80',
                isDirectVideo: false
            };
        }

        // 4. Google Drive (Video compartido)
        const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
        if (driveMatch) {
            const fileId = driveMatch[1];
            return {
                type: 'embed',
                provider: 'drive',
                providerLabel: 'Google Drive Video',
                icon: '📁',
                originalUrl: url,
                embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
                thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                isDirectVideo: false
            };
        }

        // 5. Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
        if (vimeoMatch) {
            const videoId = vimeoMatch[3] || vimeoMatch[1];
            return {
                type: 'embed',
                provider: 'vimeo',
                providerLabel: 'Vimeo Video',
                icon: '🎥',
                originalUrl: url,
                embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`,
                thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
                isDirectVideo: false
            };
        }

        // 6. Loom
        const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/i);
        if (loomMatch) {
            const videoId = loomMatch[1];
            return {
                type: 'embed',
                provider: 'loom',
                providerLabel: 'Loom Video',
                icon: '📹',
                originalUrl: url,
                embedUrl: `https://www.loom.com/embed/${videoId}?autoplay=1&muted=1`,
                thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
                isDirectVideo: false
            };
        }

        // 7. Enlaces directos a archivos de video (.mp4, .webm, .mov, .m4v, blob:, data:video)
        const isDirect = /\.(mp4|webm|mov|m4v|m3u8)(\?.*)?$/i.test(url) || url.startsWith('data:video') || url.startsWith('blob:');
        if (isDirect) {
            return {
                type: 'direct',
                provider: 'direct',
                providerLabel: 'Video Directo (MP4/WebM)',
                icon: '🎬',
                originalUrl: url,
                fileUrl: url,
                thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                isDirectVideo: true
            };
        }

        // 8. Enlace Web Genérico
        return {
            type: 'generic_link',
            provider: 'web',
            providerLabel: 'Enlace Web Multimedia',
            icon: '🌐',
            originalUrl: url,
            embedUrl: url,
            fileUrl: url,
            thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
            isDirectVideo: false
        };
    }
};

class PostCreatorManager {
    constructor() {
        this.modalEl = null;
        this.selectedMediaType = 'video';
        this.uploadedFiles = []; // Array de { file, dataUrl, mediaType, name }
        this.sourceTab = 'upload'; // 'upload' | 'link'
    }

    init() {
        this.modalEl = document.getElementById('create-post-modal');
        this.bindDropzone();
    }

    // Cambiar entre Pestañas: Subir Archivo vs Link Web
    switchSourceTab(tab) {
        this.sourceTab = tab;
        const uploadBtn = document.getElementById('btn-source-tab-upload');
        const linkBtn = document.getElementById('btn-source-tab-link');
        const uploadPane = document.getElementById('media-tab-upload-pane');
        const linkPane = document.getElementById('media-tab-link-pane');

        if (tab === 'upload') {
            uploadBtn?.classList.add('active');
            linkBtn?.classList.remove('active');
            if (uploadPane) uploadPane.style.display = 'block';
            if (linkPane) linkPane.style.display = 'none';
        } else {
            linkBtn?.classList.add('active');
            uploadBtn?.classList.remove('active');
            if (uploadPane) uploadPane.style.display = 'none';
            if (linkPane) linkPane.style.display = 'block';

            // Auto-focus en el campo de URL
            const urlInput = document.getElementById('create-post-video-url-input');
            if (urlInput) urlInput.focus();
        }
    }

    // Configurar eventos de arrastrar y soltar (Drag & Drop) y selector de archivos
    bindDropzone() {
        const dropzone = document.getElementById('file-upload-dropzone');
        const fileInput = document.getElementById('create-post-file-input');

        if (dropzone && fileInput) {
            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.add('dragover');
                });
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.remove('dragover');
                });
            });

            dropzone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                this.handleFiles(files);
            });

            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }
    }

    // Procesar archivos subidos mediante FileReader y crear miniaturas locales
    handleFiles(fileList) {
        if (!fileList || fileList.length === 0) return;

        const postType = document.getElementById('create-post-type')?.value || 'reel';
        const isCarousel = postType === 'carousel';

        if (!isCarousel) {
            this.uploadedFiles = [];
        }

        Array.from(fileList).forEach(file => {
            const isVideo = file.type.startsWith('video');
            const blobUrl = URL.createObjectURL(file);
            const reader = new FileReader();

            reader.onload = (event) => {
                const dataUrl = event.target.result;

                if (isVideo) {
                    this.generateVideoThumbnail(file).then(thumbUrl => {
                        this.uploadedFiles.push({
                            file: file,
                            blobUrl: blobUrl,
                            dataUrl: dataUrl,
                            thumbnailUrl: thumbUrl || dataUrl,
                            mediaType: 'video',
                            name: file.name
                        });
                        this.renderUploadedPreviews();
                    });
                } else {
                    this.uploadedFiles.push({
                        file: file,
                        blobUrl: blobUrl,
                        dataUrl: dataUrl,
                        thumbnailUrl: dataUrl,
                        mediaType: 'image',
                        name: file.name
                    });
                    this.renderUploadedPreviews();
                }
            };

            reader.readAsDataURL(file);
        });
    }

    // Extraer fotograma representativo del video subido como miniatura
    generateVideoThumbnail(videoFile) {
        return new Promise((resolve) => {
            try {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.src = URL.createObjectURL(videoFile);
                video.muted = true;
                video.playsInline = true;

                video.onloadeddata = () => {
                    video.currentTime = Math.min(1, (video.duration || 1) / 2);
                };

                video.onseeked = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.min(640, video.videoWidth || 480);
                        canvas.height = Math.min(1136, video.videoHeight || 854);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const thumbUrl = canvas.toDataURL('image/jpeg', 0.85);
                        resolve(thumbUrl);
                    } catch (e) {
                        resolve(null);
                    }
                };

                video.onerror = () => resolve(null);
                setTimeout(() => resolve(null), 2500);
            } catch (e) {
                resolve(null);
            }
        });
    }

    // Renderizar miniaturas de los archivos cargados
    renderUploadedPreviews() {
        const previewContainer = document.getElementById('uploaded-files-preview-list');
        if (!previewContainer) return;

        if (this.uploadedFiles.length === 0) {
            previewContainer.innerHTML = '';
            return;
        }

        previewContainer.innerHTML = this.uploadedFiles.map((item, idx) => `
            <div class="uploaded-thumb-card">
                ${item.mediaType === 'video' ? `
                    <video src="${item.blobUrl || item.dataUrl}" muted></video>
                    <span class="thumb-tag-badge">🎬 Video</span>
                ` : `
                    <img src="${item.thumbnailUrl || item.dataUrl}" alt="${item.name}" />
                    <span class="thumb-tag-badge">🖼️ ${idx + 1}</span>
                `}
                <button type="button" class="btn-remove-thumb" onclick="window.postCreator.removeUploadedFile(${idx})" title="Eliminar">✕</button>
            </div>
        `).join('');
    }

    removeUploadedFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.renderUploadedPreviews();
    }

    // ==========================================================
    // GESTIÓN DE ENLACES DE VIDEO WEB (YOUTUBE, TIKTOK, DRIVE, ETC.)
    // ==========================================================

    // Entrada en tiempo real de URL
    handleUrlInput(url) {
        if (!url || !url.trim()) {
            this.hideUrlPreview();
            return;
        }
        const parsed = window.mediaHelper.parseVideoUrl(url);
        if (!parsed) {
            this.hideUrlPreview();
            return;
        }

        // Mostrar Badge de Plataforma Detectada
        const infoBox = document.getElementById('url-detected-info-box');
        const badgeEl = document.getElementById('url-provider-badge');
        const titleEl = document.getElementById('url-detected-title');

        if (infoBox && badgeEl && titleEl) {
            infoBox.style.display = 'flex';
            badgeEl.innerHTML = `<span>${parsed.icon} ${parsed.providerLabel}</span>`;
            titleEl.textContent = `Enlace válido listo para reproducir y compartir`;
        }

        // Previsualizar automáticamente si es link conocido
        this.renderUrlLivePreview(parsed);
    }

    // Vista previa explícita
    previewUrlLink() {
        const urlInput = document.getElementById('create-post-video-url-input');
        const url = urlInput ? urlInput.value.trim() : '';
        if (!url) {
            alert('Por favor pega primero un enlace de video.');
            return;
        }
        const parsed = window.mediaHelper.parseVideoUrl(url);
        if (parsed) {
            this.renderUrlLivePreview(parsed);
        } else {
            alert('No se pudo reconocer el formato del enlace.');
        }
    }

    // Renderizar marco de previsualización en vivo
    renderUrlLivePreview(parsed) {
        const previewBox = document.getElementById('url-live-preview-box');
        const frameWrapper = document.getElementById('url-preview-frame-wrapper');
        if (!previewBox || !frameWrapper) return;

        previewBox.style.display = 'block';

        if (parsed.isDirectVideo) {
            frameWrapper.innerHTML = `
                <div class="mini-phone-preview">
                    <video src="${parsed.fileUrl}" controls autoplay muted playsinline class="mini-preview-media"></video>
                </div>
            `;
        } else if (parsed.type === 'embed') {
            frameWrapper.innerHTML = `
                <div class="mini-phone-preview">
                    <iframe src="${parsed.embedUrl}" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen class="mini-preview-iframe"></iframe>
                </div>
            `;
        } else {
            frameWrapper.innerHTML = `
                <div class="mini-link-card-preview">
                    <img src="${parsed.thumbnailUrl}" class="mini-preview-thumb-img" alt="Portada" />
                    <div class="mini-link-info">
                        <strong>${parsed.providerLabel}</strong>
                        <a href="${parsed.originalUrl}" target="_blank" class="mini-link-href">${parsed.originalUrl}</a>
                    </div>
                </div>
            `;
        }
    }

    hideUrlPreview() {
        const infoBox = document.getElementById('url-detected-info-box');
        const previewBox = document.getElementById('url-live-preview-box');
        if (infoBox) infoBox.style.display = 'none';
        if (previewBox) previewBox.style.display = 'none';
    }

    clearUrlInput() {
        const urlInput = document.getElementById('create-post-video-url-input');
        const customPoster = document.getElementById('create-post-custom-poster');
        if (urlInput) urlInput.value = '';
        if (customPoster) customPoster.value = '';
        this.hideUrlPreview();
    }

    // ==========================================================
    // APERTURA Y CIERRE DEL MODAL
    // ==========================================================
    open() {
        if (!this.modalEl) return;
        this.uploadedFiles = [];
        this.renderUploadedPreviews();
        this.clearUrlInput();
        this.switchSourceTab('upload');
        
        // Cargar clientes en el selector del modal
        const clientSelect = document.getElementById('create-post-client-id');
        if (clientSelect) {
            const accessibleClients = window.authManager.getAccessibleClients();
            const activeId = window.authManager.getActiveClientId();
            const hasRestricted = window.authManager.hasRestrictedClient();

            clientSelect.innerHTML = accessibleClients.map(c => `
                <option value="${c.id}" ${c.id === activeId ? 'selected' : ''}>${c.name}</option>
            `).join('');

            // Deshabilitar selector si el usuario está restringido
            clientSelect.disabled = hasRestricted;
            clientSelect.style.backgroundColor = hasRestricted ? '#f8fafc' : '';
            clientSelect.style.cursor = hasRestricted ? 'not-allowed' : 'pointer';
        }

        // Establecer fecha por defecto (mañana)
        const dateInput = document.getElementById('create-post-date');
        if (dateInput && !dateInput.value) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }

        this.modalEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.modalEl) return;
        this.modalEl.classList.remove('active');
        document.body.style.overflow = '';
        this.uploadedFiles = [];
        this.clearUrlInput();
    }

    // Cambiar tipo de post (Reel vs Imagen vs Carrusel)
    setPostType(type) {
        const fileInput = document.getElementById('create-post-file-input');
        const uploadHint = document.getElementById('upload-prompt-hint');

        if (type === 'reel') {
            this.selectedMediaType = 'video';
            if (fileInput) fileInput.accept = 'video/mp4,video/quicktime,video/webm';
            if (uploadHint) uploadHint.textContent = 'Arrastra tu video Reel aquí (MP4, MOV, WEBM - vertical 9:16)';
        } else if (type === 'carousel') {
            this.selectedMediaType = 'image';
            if (fileInput) {
                fileInput.accept = 'image/*';
                fileInput.multiple = true;
            }
            if (uploadHint) uploadHint.textContent = 'Arrastra las imágenes para tu Carrusel (puedes subir varias)';
        } else {
            this.selectedMediaType = 'image';
            if (fileInput) {
                fileInput.accept = 'image/*';
                fileInput.multiple = false;
            }
            if (uploadHint) uploadHint.textContent = 'Arrastra la foto o diseño aquí (JPG, PNG, WEBP)';
        }
    }

    // Obtener lista de plataformas seleccionadas
    getSelectedPlatforms() {
        const checkboxes = document.querySelectorAll('input[name="target_platforms"]:checked');
        const platforms = Array.from(checkboxes).map(cb => cb.value);
        return platforms.length > 0 ? platforms.join(', ') : 'instagram';
    }

    // ==========================================================
    // GUARDAR NUEVO POST / REEL (ARCHIVO O LINK WEB)
    // ==========================================================
    async submitNewPost() {
        let clientIdVal = document.getElementById('create-post-client-id')?.value;
        const currentUser = window.authManager.getCurrentUser();
        if (currentUser && currentUser.client_id) {
            clientIdVal = currentUser.client_id;
        }
        const clientId = parseInt(clientIdVal);
        const title = document.getElementById('create-post-title')?.value.trim();
        const postType = document.getElementById('create-post-type')?.value || 'reel';
        const scheduledDate = document.getElementById('create-post-date')?.value;
        const caption = document.getElementById('create-post-caption')?.value.trim();
        const hashtags = document.getElementById('create-post-hashtags')?.value.trim();
        const observation = document.getElementById('create-post-observation')?.value.trim();
        const platforms = this.getSelectedPlatforms();

        if (!title || !scheduledDate || !caption) {
            alert('Por favor completa los campos requeridos: Título, Fecha de publicación y Copy.');
            return;
        }

        let mediaInput = null;

        // CASO A: CARGA MEDIANTE ENLACE WEB (LINK)
        if (this.sourceTab === 'link') {
            const urlInput = document.getElementById('create-post-video-url-input');
            const videoUrl = urlInput ? urlInput.value.trim() : '';

            if (!videoUrl) {
                alert('Por favor introduce la URL del video o cambia a la pestaña "Subir Archivo".');
                return;
            }

            const parsed = window.mediaHelper.parseVideoUrl(videoUrl);
            const customPoster = document.getElementById('create-post-custom-poster')?.value.trim();

            mediaInput = {
                media_type: 'video',
                file_url: parsed.originalUrl,
                embed_url: parsed.embedUrl || parsed.fileUrl,
                thumbnail_url: customPoster || parsed.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
                aspect_ratio: '9:16',
                is_external_link: true,
                external_source: parsed.provider || 'web'
            };
        } 
        // CASO B: CARGA DIRECTA DE ARCHIVOS LOCALES
        else {
            // Subir archivos a Supabase Storage si la nube está disponible
            if (window.supabaseService?.client && this.uploadedFiles.length > 0) {
                for (const item of this.uploadedFiles) {
                    if (item.file) {
                        try {
                            const cloudUrl = await window.supabaseService.uploadMedia(item.file);
                            if (cloudUrl) {
                                item.dataUrl = cloudUrl;
                            }
                        } catch (err) {
                            console.warn('Fallback a almacenamiento local para archivo:', item.name);
                        }
                    }
                }
            }

            if (this.uploadedFiles.length > 0) {
                if (postType === 'carousel') {
                    mediaInput = this.uploadedFiles.map((item, idx) => ({
                        media_type: item.mediaType,
                        file_url: item.dataUrl,
                        thumbnail_url: item.thumbnailUrl || item.dataUrl,
                        aspect_ratio: '1:1',
                        order_index: idx + 1,
                        slide_caption: `Diapositiva ${idx + 1}`
                    }));
                } else {
                    const first = this.uploadedFiles[0];
                    mediaInput = {
                        media_type: first.mediaType,
                        file_url: first.dataUrl,
                        thumbnail_url: first.thumbnailUrl || first.dataUrl,
                        aspect_ratio: postType === 'reel' ? '9:16' : '1:1'
                    };
                }
            } else {
                // Fallback de demostración si no se arrastra archivo
                if (postType === 'reel') {
                    mediaInput = {
                        media_type: 'video',
                        file_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
                        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                        aspect_ratio: '9:16'
                    };
                } else {
                    mediaInput = {
                        media_type: 'image',
                        file_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
                        thumbnail_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
                        aspect_ratio: '1:1'
                    };
                }
            }
        }

        const postData = {
            client_id: clientId,
            title: title,
            caption: caption,
            hashtags: hashtags,
            platform: platforms,
            post_type: postType,
            observation_internal: observation,
            scheduled_date: scheduledDate
        };

        const newId = window.dbStore.createPost(postData, mediaInput);
        if (newId) {
            window.uiRenderer.showToast('¡Publicación programada exitosamente!', 'check');
            this.close();
            
            // Limpiar campos del formulario
            document.getElementById('create-post-title').value = '';
            document.getElementById('create-post-caption').value = '';
            document.getElementById('create-post-hashtags').value = '';
            document.getElementById('create-post-observation').value = '';
            this.clearUrlInput();

            // Sincronizar cliente activo y renderizar
            window.authManager.setActiveClientId(clientId);
            window.uiRenderer.renderAll();
        }
    }
}

window.postCreator = new PostCreatorManager();
