const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  StringSelectMenuBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const db = require("./database");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

// IDs (JÁ CONFIGURADOS)
const CLIENT_ID = "1488761851373420574";
const GUILD_ID = "1488760106790424726";
const CARGO_SUPORTE = "1488760517332963419";
const CARGO_AUX = "1488760243038060605";
const CARGO_DONO = "1488760420473766028";

// IA SIMPLES
function responderIA(msg) {
  msg = msg.toLowerCase();

  if (msg.includes("pagamento")) return "💳 Seu pagamento pode levar alguns minutos.";
  if (msg.includes("erro")) return "⚠️ Tente reiniciar ou reinstalar.";
  if (msg.includes("login")) return "🔐 Verifique seus dados.";

  return "🤖 Não entendi, aguarde suporte.";
}

client.once("ready", () => {
  console.log(`🔥 Bot online: ${client.user.tag}`);
});

// REGISTRAR /painel
const commands = [
  new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Criar painel de tickets')
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comando /painel registrado");
  } catch (err) {
    console.log(err);
  }
})();

// INTERAÇÕES
client.on("interactionCreate", async (interaction) => {

  // COMANDO /painel
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "painel") {

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("abrir_ticket")
          .setLabel("🎟️ Abrir Ticket")
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        content: "🎫 Painel de suporte\nClique abaixo para abrir um ticket:",
        components: [row]
      });
    }
  }

  // ABRIR TICKET
  if (interaction.isButton() && interaction.customId === "abrir_ticket") {

    const canal = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: CARGO_SUPORTE, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: CARGO_AUX, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: CARGO_DONO, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    db.run(`INSERT INTO tickets (user, canal, status) VALUES (?, ?, ?)`, [
      interaction.user.id,
      canal.id,
      "aberto"
    ]);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("duvida")
      .setPlaceholder("Escolha sua dúvida")
      .addOptions([
        { label: "Pagamento", value: "pagamento" },
        { label: "Erro", value: "erro" },
        { label: "Login", value: "login" }
      ]);

    const fechar = new ButtonBuilder()
      .setCustomId("fechar")
      .setLabel("Fechar Ticket")
      .setStyle(ButtonStyle.Danger);

    await canal.send({
      content: `🎟️ Ticket aberto por ${interaction.user}
<@&${CARGO_SUPORTE}> <@&${CARGO_AUX}> <@&${CARGO_DONO}>`,
      components: [
        new ActionRowBuilder().addComponents(menu),
        new ActionRowBuilder().addComponents(fechar)
      ]
    });

    await interaction.reply({ content: "✅ Ticket criado!", ephemeral: true });
  }

  // RESPOSTA MENU
  if (interaction.isStringSelectMenu()) {
    await interaction.reply({
      content: responderIA(interaction.values[0])
    });
  }

  // FECHAR
  if (interaction.isButton() && interaction.customId === "fechar") {

    if (
      !interaction.member.roles.cache.has(CARGO_SUPORTE) &&
      !interaction.member.roles.cache.has(CARGO_AUX) &&
      !interaction.member.roles.cache.has(CARGO_DONO)
    ) {
      return interaction.reply({ content: "❌ Sem permissão!", ephemeral: true });
    }

    db.run(`UPDATE tickets SET status = ? WHERE canal = ?`, ["fechado", interaction.channel.id]);

    await interaction.channel.delete();
  }

});

// RESPOSTA AUTOMÁTICA
client.on("messageCreate", (msg) => {
  if (msg.channel.name.startsWith("ticket-") && !msg.author.bot) {
    msg.reply(responderIA(msg.content));
  }
});

client.login(TOKEN);
