<template>
    <div class="all row justify-center align-center">
        <div class="column gap-8">
            <img
                height="280"
                src="/not-found.png"
            >

            <div class="mb-18 text-center text-grey subtitle">
                Oups, cette page n'existe pas !
            </div>

            <router-link
                to="/"
                class="row justify-center"
            >
                <button class="primary">
                    Retourner à l'accueil
                </button>
            </router-link>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.all {
    height: calc(100vh - 80px);
}
</style>
