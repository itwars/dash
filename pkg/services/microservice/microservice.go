package microservice

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/cmd/grafana-cli/logger"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
)

type Microservice struct {
	Cfg *setting.Cfg
	log log.Logger
	Bus bus.Bus
}

func ProvideService(bus bus.Bus, cfg *setting.Cfg) (*Microservice, error) {
	ms := &Microservice{
		Bus: bus,
		Cfg: cfg,
		log: log.New("microservice"),
	}
	ms.Bus.AddHandler(ms.DownLink)
	return ms, nil
}

func (ms *Microservice) DownLink(cmd *models.DownLinkMsg) error {
	body, err := json.Marshal(*cmd)
	if err != nil {
		return err
	}

	webCmd := &models.SendWebhookSync{
		Url:         ms.Cfg.Service.Writer + "api/downlink",
		HttpMethod:  http.MethodPost,
		HttpHeader:  make(map[string]string),
		ContentType: "application/json",
		Body:        string(body),
	}

	if err := bus.DispatchCtx(context.Background(), webCmd); err != nil {
		logger.Error("faild to send downlink", "error", err)
		return err
	}
	return nil
}
