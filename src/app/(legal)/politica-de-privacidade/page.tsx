export const metadata = { title: "Política de Privacidade" };

const SECTIONS = [
  {
    title: "1. Quais dados coletamos",
    body: "Nome, e-mail, telefone, CPF/CNPJ (quando informado), foto de perfil (opcional), endereços de propriedades cadastradas, dados de máquinas anunciadas, histórico de aluguéis, mensagens trocadas em um aluguel e avaliações. Não coletamos dados de cartão de crédito — o pagamento nesta versão é inteiramente simulado.",
  },
  {
    title: "2. Para que usamos esses dados",
    body: "Para viabilizar o cadastro e o login, exibir anúncios e calcular distância estimada até cada máquina, processar solicitações de aluguel, calcular o valor da locação e da logística, permitir a comunicação entre locatário e proprietário durante um aluguel, e possibilitar avaliações após a conclusão. Nunca vendemos dados pessoais a terceiros.",
  },
  {
    title: "3. Com quem compartilhamos",
    body: "O endereço exato de uma propriedade só é revelado ao locatário depois que o pagamento é confirmado — antes disso, é exibida apenas a localização aproximada (cidade/UF e distância estimada). Nome e contato do locatário e do proprietário ficam visíveis um ao outro somente após uma solicitação de aluguel ser criada, para viabilizar a comunicação necessária à locação.",
  },
  {
    title: "4. Por quanto tempo guardamos",
    body: "Dados de aluguéis concluídos e pagamentos são mantidos mesmo após a desativação de uma conta, para cumprir eventual obrigação de retenção fiscal e financeira. Ao solicitar a exclusão de dados (Configurações > Privacidade), avaliamos o que pode ser removido de fato e o que precisa ser retido por obrigação legal — nesse caso, os dados retidos são usados apenas para essa finalidade.",
  },
  {
    title: "5. Seus direitos (LGPD)",
    body: "Você pode, a qualquer momento: acessar e corrigir seus dados em Meu perfil; desativar sua conta em Configurações > Conta; e solicitar a exclusão dos seus dados em Configurações > Privacidade. Pedidos de exclusão são analisados manualmente, já que parte do histórico financeiro pode precisar ser retida por obrigação legal.",
  },
  {
    title: "6. Cookies",
    body: "Usamos apenas um cookie de sessão, essencial para manter você autenticado — não usamos cookies de rastreamento ou publicidade.",
  },
  {
    title: "7. Segurança",
    body: "Senhas são armazenadas com hash criptográfico, nunca em texto puro. O acesso aos dados de outros usuários é sempre verificado no servidor antes de qualquer operação, nunca apenas escondido na interface.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <article className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Última atualização: agosto de 2026. Este documento é uma versão simplificada, elaborada
          para fins acadêmicos, alinhada aos princípios da LGPD — não substitui aconselhamento
          jurídico profissional.
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
