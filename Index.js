const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType,
  PermissionsBitField,
  StringSelectMenuBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// CONFIG
const TOKEN = "MTQ4ODc2MTg1MTM3MzQyMDU3NA.GZLSF-.STA84E-BIYH5FzXKlBSbUYJWL_wVMujSFBo2W4";
const CARGO_SUPORTE = "1488760517332963419";
const CARGO_AUX = "1488760243038060605";
const CARGO_DONO = "1488760420473766028";

client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

// 🔥 PAINEL DE TICKET
client.on("interactionCreate", async (interaction) => {

  // ABRIR TICKET
  if (interaction.isButton() && interaction.customId === "abrir_ticket") {

    const canal = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: CARGO_SUPORTE,
          allow: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: CARGO_AUX,
          allow: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: CARGO_DONO,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("duvida_select")
      .setPlaceholder("Escolha sua dúvida")
      .addOptions([
        { label: "Pagamento", value: "pagamento" },
        { label: "Erro no produto", value: "erro" },
        { label: "Dúvida geral", value: "duvida" }
      ]);

    const rowMenu = new ActionRowBuilder().addComponents(menu);

    const fechar = new ButtonBuilder()
      .setCustomId("fechar_ticket")
      .setLabel("Fechar Ticket")
      .setStyle(ButtonStyle.Danger);

    const rowBtn = new ActionRowBuilder().addComponents(fechar);

    await canal.send({
      content: `🎟️ Ticket aberto por ${interaction.user}

<@&${CARGO_SUPORTE}> <@&${CARGO_AUX}> <@&${CARGO_DONO}>`,
      components: [rowMenu, rowBtn]
    });

    await interaction.reply({ content: "Ticket criado!", ephemeral: true });
  }

  // 🧠 RESPOSTA AUTOMÁTICA
  if (interaction.isStringSelectMenu()) {

    let resposta = "";

    if (interaction.values[0] === "pagamento") {
      resposta = "💳 Se seu pagamento não caiu, aguarde até 10 minutos ou verifique seu comprovante.";
    }

    if (interaction.values[0] === "erro") {
      resposta = "⚠️ Tente reiniciar o produto. Se persistir, envie print.";
    }

    if (interaction.values[0] === "duvida") {
      resposta = "📩 Descreva melhor sua dúvida e um atendente irá te ajudar.";
    }

    await interaction.reply({ content: resposta, ephemeral: false });
  }

  // ❌ FECHAR TICKET
  if (interaction.isButton() && interaction.customId === "fechar_ticket") {

    if (
      !interaction.member.roles.cache.has(CARGO_SUPORTE) &&
      !interaction.member.roles.cache.has(CARGO_AUX) &&
      !interaction.member.roles.cache.has(CARGO_DONO)
    ) {
      return interaction.reply({ content: "Sem permissão!", ephemeral: true });
    }

    await interaction.channel.delete();
  }
});

client.login(MTQ4ODc2MTg1MTM3MzQyMDU3NA.GZLSF-.STA84E-BIYH5FzXKlBSbUYJWL_wVMujSFBo2W4);
