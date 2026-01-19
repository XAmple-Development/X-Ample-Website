export default function Complete() {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Payment complete</h1>
        <p className="mt-3 opacity-80">Sorry!! Your purchase has been cancelled.</p>
        <a className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-white" href="/store">
          Back to store
        </a>
      </main>
    );
  }
  