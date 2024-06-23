import { getPlatformConfig } from "@/lib/api/platform";
import type { CaptchaConfig, Config } from "@/lib/models/config";
import Checkbox from "@/lib/widgets/checkbox";
import { createForm, setValues } from "@modular-forms/solid";
import { Title } from "@storage/header";
import { platformStore } from "@storage/platform";
import { t } from "@storage/theme";
import { createSignal, onMount } from "solid-js";

export default function () {
    const [form, { Form, Field }] = createForm<CaptchaConfig>();
    const [loading, setLoading] = createSignal(false);
    const [config, setConfig] = createSignal(null as null | Config);
    onMount(() => {
        getPlatformConfig().then((resp) => {
            setConfig(resp);
            setValues(form, {
                enabled: resp.captcha.enabled,
                difficulty: resp.captcha.difficulty,
                validator: resp.captcha.validator,
            });
        });
    });
    function onSubmit(form: CaptchaConfig) {}
    return (
        <>
            <Title title={`${t("admin.captcha.title")} - ${platformStore.config.name || t("platform.name")}`} />
            <div class="flex-1 flex flex-col items-center">
                <div class="w-full max-w-5xl p-3 lg:p-6 flex flex-col space-y-2">
                    <h3 class="h-12 flex items-center border-b border-b-layer-content/10 font-bold space-x-2">
                        <span class="icon-[fluent--settings-20-regular] w-5 h-5" />
                        <span>{t("admin.captcha.title")}</span>
                    </h3>
                    <Form onSubmit={onSubmit} class="w-full flex flex-col space-y-2">
                        <Field name="enabled" type="boolean">
                            {(field, props) => (
                                <Checkbox
                                    inputProps={props}
                                    checked={field.value}
                                    error={field.error}
                                    title={t("captcha.enabled")}
                                >
                                    <span class="flex-1 text-start">{t("captcha.enabled")}</span>
                                </Checkbox>
                            )}
                        </Field>
                    </Form>
                </div>
            </div>
        </>
    );
}
