export const metadata = { title: "Termos de Uso" };

const SECTIONS = [
  {
    title: "1. Sobre a Arvum",
    body: "A Arvum é uma plataforma digital (marketplace) que conecta produtores rurais que precisam alugar máquinas agrícolas a proprietários com equipamentos disponíveis. A Arvum não é proprietária das máquinas anunciadas, não emprega operadores e não presta o serviço de transporte diretamente — atua como intermediária, organizando a busca, o aluguel, o pagamento e a comunicação entre as partes.",
  },
  {
    title: "2. Cadastro",
    body: "Para usar a Arvum é necessário criar uma conta com informações verdadeiras e atualizadas. Uma mesma conta pode alugar máquinas (locatário) e anunciar máquinas próprias (proprietário) — não é preciso criar contas separadas para cada papel. Você é responsável por manter sua senha em sigilo e por toda atividade realizada na sua conta.",
  },
  {
    title: "3. Anúncios e aluguéis",
    body: "Proprietários são responsáveis pela veracidade das informações do anúncio (condição, disponibilidade, preço) e pelas condições reais da máquina anunciada. Locatários são responsáveis por usar a máquina conforme combinado e devolvê-la nas condições acordadas. A Arvum verifica disponibilidade e impede aluguéis conflitantes, mas não garante a condição física do equipamento nem realiza vistoria presencial.",
  },
  {
    title: "4. Pagamentos e comissão",
    body: "Nesta versão de demonstração (MVP acadêmico), o pagamento é inteiramente simulado — nenhum dado de cartão é coletado e nenhuma cobrança real ocorre. A Arvum retém uma comissão sobre cada operação concluída, sempre incluída de forma transparente na composição do preço apresentada antes da confirmação, nunca cobrada como taxa oculta.",
  },
  {
    title: "5. Cancelamento",
    body: "A política de cancelamento e as regras de estorno são apresentadas ao usuário antes da confirmação de qualquer cancelamento, e variam conforme o estágio do aluguel e quem está cancelando.",
  },
  {
    title: "6. Avaliações",
    body: "Após a conclusão de uma locação, locatário e proprietário podem avaliar um ao outro. Avaliações devem refletir a experiência real; conteúdo ofensivo ou falso pode ser denunciado e removido pela moderação.",
  },
  {
    title: "7. Suspensão e encerramento de conta",
    body: "Contas que violem estes termos, apresentem informações falsas ou sejam usadas de forma fraudulenta podem ser suspensas. Você pode desativar sua própria conta a qualquer momento em Configurações — o histórico de aluguéis e avaliações é mantido conforme descrito na nossa Política de Privacidade.",
  },
  {
    title: "8. Limitações desta versão",
    body: "Este é um projeto acadêmico (Startup One, FIAP). Funcionalidades como rastreamento em tempo real, seguro contratado automaticamente, integrações de pagamento reais e assinatura eletrônica com validade jurídica não estão implementadas — quando mencionadas na plataforma, são simuladas para fins de demonstração.",
  },
];

export default function TermsOfServicePage() {
  return (
    <article className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Termos de Uso</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Última atualização: agosto de 2026. Este documento é uma versão simplificada, elaborada
          para fins acadêmicos — não substitui aconselhamento jurídico profissional.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm font-semibold text-neutral-900">{section.title}</h2>
            <p className="mt-2 text-sm text-neutral-700">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
