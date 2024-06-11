import { getUser } from "@/lib/api/user";
import SidebarLayout from "@/lib/blocks/sidebar-layout";
import type { User } from "@/lib/models/user";
import { Title } from "@/lib/storage/header";
import { platformStore } from "@/lib/storage/platform";
import { t } from "@/lib/storage/theme";
import Article from "@/lib/widgets/article";
import LoadingTips from "@/lib/widgets/loading-tips";
import { useNavigate, useParams } from "@solidjs/router";
import { Match, Switch, createSignal } from "solid-js";
import Sidebar from "./_blocks/sidebar";

export default function () {
    const [user, setUser] = createSignal(null as null | User);
    const [loading, setLoading] = createSignal(true);
    const params = useParams();
    const navigate = useNavigate();
    const userId = Number.parseInt(params.user) || null;
    if (!userId) {
        navigate("/sigtrap/404", { replace: true });
        return null;
    }
    getUser(userId)
        .then(setUser)
        .finally(() => setLoading(false));
    return (
        <>
            <Title title={`${user()?.nickname} - ${platformStore.config.name || t("platform.name")!}`} />
            <SidebarLayout leftBar={<Sidebar user={user()} loading={loading()} />}>
                <div class="flex-1 flex flex-col items-center">
                    <div class="flex flex-col w-full max-w-5xl p-3 lg:p-6">
                        <h3 class="h-12 flex items-center border-b border-b-layer-content/10 font-bold space-x-2">
                            <span class="icon-[fluent--person-20-regular] w-5 h-5" />
                            <span>{t("user.introductionTitle")}</span>
                        </h3>
                        <section>
                            <Switch>
                                <Match when={loading()}>
                                    <LoadingTips />
                                </Match>
                                <Match when={true}>
                                    <Article content={user()?.description || t("user.noDescription")!} />
                                </Match>
                            </Switch>
                        </section>
                        <h3 class="h-12 flex items-center border-b border-b-layer-content/10 font-bold space-x-2">
                            <span class="icon-[fluent--flag-20-regular] w-5 h-5" />
                            <span>{t("user.joinedGamesTitle")}</span>
                        </h3>
                    </div>
                </div>
            </SidebarLayout>
        </>
    );
}
