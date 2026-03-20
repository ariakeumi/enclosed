import { authStore } from '@/modules/auth/auth.store';
import { getFileIcon } from '@/modules/files/files.models';
import { useI18n } from '@/modules/i18n/i18n.provider';
import { isHttpErrorWithCode, isRateLimitError } from '@/modules/shared/http/http-errors';
import { cn } from '@/modules/shared/style/cn';
import { CopyButton } from '@/modules/shared/utils/copy';
import { Alert, AlertDescription } from '@/modules/ui/components/alert';
import { Button } from '@/modules/ui/components/button';
import { Card, CardContent } from '@/modules/ui/components/card';
import { formatBytes, safely } from '@corentinth/chisels';
import { noteAssetsToFiles, parseNotePayload } from '@enclosed/lib';
import { useLocation, useNavigate, useParams } from '@solidjs/router';
import JSZip from 'jszip';
import { type Component, createSignal, type JSX, Match, onMount, Switch } from 'solid-js';
import { fetchNoteById } from '../notes.services';

export const ViewNotePage: Component = () => {
  const params = useParams();
  const location = useLocation();
  const [getError, setError] = createSignal<{ title: string; description: string; action?: JSX.Element } | null>(null);
  const [getNoteContent, setNoteContent] = createSignal<string | null>(null);
  const [getDeleteAfterReading, setDeleteAfterReading] = createSignal(false);
  const [fileAssets, setFileAssets] = createSignal<File[]>([]);
  const [isDownloadingAllLoading, setIsDownloadingAllLoading] = createSignal(false);

  const { t } = useI18n();
  const navigate = useNavigate();

  onMount(async () => {
    const [fetchedNote, fetchError] = await safely(fetchNoteById({ noteId: params.noteId }));

    if (isRateLimitError({ error: fetchError })) {
      setError({
        title: t('view.error.rate-limit.title'),
        description: t('view.error.rate-limit.description'),
      });
      return;
    }

    if (isHttpErrorWithCode({ error: fetchError, code: 'auth.unauthorized' })) {
      setError({
        title: t('view.error.unauthorized.title'),
        description: t('view.error.unauthorized.description'),
        action: (
          <Button
            onClick={() => {
              authStore.setRedirectUrl(location.pathname + location.hash);
              navigate('/login');
            }}
            variant="secondary"
          >
            <div class="i-tabler-login-2 mr-2 text-lg"></div>
            {t('view.error.unauthorized.button')}
          </Button>
        ),
      });
      return;
    }

    if (isHttpErrorWithCode({ error: fetchError, code: 'note.not_found' })) {
      setError({
        title: t('view.error.note-not-found.title'),
        description: t('view.error.note-not-found.description'),
      });
      return;
    }

    if (fetchError) {
      setError({
        title: t('view.error.fetch-error.title'),
        description: t('view.error.fetch-error.description'),
      });
      return;
    }

    const [parsedNote, parsingNoteError] = await safely(parseNotePayload({
      payload: fetchedNote.note.payload,
      serializationFormat: fetchedNote.note.serializationFormat as 'cbor-array',
    }));

    if (parsingNoteError) {
      setError({
        title: t('view.error.fetch-error.title'),
        description: t('view.error.fetch-error.description'),
      });
      return;
    }

    const files = await noteAssetsToFiles({ noteAssets: parsedNote.note.assets });

    setDeleteAfterReading(fetchedNote.note.deleteAfterReading);
    setFileAssets(files);
    setNoteContent(parsedNote.note.content);
  });

  const downloadFile = async ({ file }: { file: File }) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = async () => {
    setIsDownloadingAllLoading(true);
    const zipFile = new JSZip();
    fileAssets().forEach((file) => {
      zipFile.file(file.name, file);
    });

    const blob = await zipFile.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note-files.zip';
    a.click();
    URL.revokeObjectURL(url);
    setIsDownloadingAllLoading(false);
  };

  return (
    <div>
      <Switch
        fallback={(
          <div class="mx-auto max-w-400px text-center mt-6 flex flex-col justify-center items-center p-6 gap-2">
            <div class="i-tabler-loader-2 text-3xl animate-spin text-muted-foreground op-60"></div>
            <div class="text-muted-foreground">{t('view.loading')}</div>
          </div>
        )}
      >
        <Match when={getError()}>
          {error => (
            <div class="mx-auto max-w-300px text-center mt-6 flex flex-col justify-center items-center">
              <div class="i-tabler-alert-triangle text-4xl text-muted-foreground op-60"></div>
              <div class="text-lg font-bold mt-2">
                {error().title}
              </div>
              <div class="mt-2 mb-4 text-muted-foreground text-pretty">
                {error().description}
              </div>

              {error().action}
            </div>
          )}
        </Match>

        <Match when={getNoteContent() !== null || fileAssets().length > 0}>
          <div class="mx-auto max-w-1200px px-6 mt-6 flex gap-4 md:flex-row-reverse flex-col justify-center min-w-0">
            {getNoteContent() && (
              <div class="flex-1 mb-4 min-w-0">
                <div class="flex items-center gap-2 mb-4 justify-between">
                  <div class="text-muted-foreground">
                    {t('view.note-content')}
                  </div>
                  <CopyButton text={getNoteContent()!} variant="secondary" />
                </div>

                <Match when={getDeleteAfterReading()}>
                  <Alert variant="destructive" class="mb-4">
                    <div class="i-tabler-alert-triangle" />
                    <AlertDescription>
                      <span class="font-medium">{t('view.warn-for-note-deletion.title')}</span>
                      {' '}
                      {t('view.warn-for-note-deletion.description')}
                    </AlertDescription>
                  </Alert>
                </Match>

                <Card class="w-full rounded-md shadow-sm mb-2">
                  <CardContent class="p-6 overflow-x-auto max-w-100%">
                    <pre data-test-id="note-content-display">
                      {getNoteContent()}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

            {fileAssets().length > 0 && (
              <div class="flex flex-col gap-4">
                <div class="flex md:min-w-500px items-center h-9">
                  <div class="text-muted-foreground">
                    {
                      fileAssets().length > 1
                        ? t('view.assets.heading-multiple', { count: fileAssets().length })
                        : t('view.assets.heading-single')
                    }
                  </div>

                  {fileAssets().length > 1 && (
                    <Button
                      class="ml-auto"
                      variant="secondary"
                      onClick={downloadAllFiles}
                      disabled={isDownloadingAllLoading()}
                    >
                      {isDownloadingAllLoading()
                        ? <div class="i-tabler-loader-2 mr-2 text-lg animate-spin"></div>
                        : <div class="i-tabler-file-zip mr-2 text-lg"></div>}

                      {t('view.assets.download-all')}
                    </Button>
                  )}
                </div>

                <div class="flex flex-col gap-2 md:min-w-500px">
                  {
                    fileAssets().map(file => (
                      <Card class="w-full rounded-md shadow-sm ">
                        <CardContent class="p-4 flex items-center gap-3">
                          <div class={cn('text-4xl text-muted-foreground op-50 flex-shrink-0', getFileIcon({ file }))} />
                          <div class="flex flex-col min-w-0">
                            <button class="p-0 h-auto cursor-pointer hover:underline truncate block" onClick={() => downloadFile({ file })} title={file.name}>
                              {file.name}
                            </button>
                            <div class="text-muted-foreground text-xs">
                              {formatBytes({ bytes: file.size })}
                            </div>
                          </div>
                          <div class="ml-auto">
                            <Button variant="secondary" onClick={() => downloadFile({ file })}>
                              <div class="i-tabler-download mr-2 text-lg"></div>
                              {t('view.assets.download')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </Match>
      </Switch>
    </div>
  );
};
