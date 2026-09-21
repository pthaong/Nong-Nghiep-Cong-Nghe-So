package controller;

import com.smartagriculture.backend.entity.Symptom;
import com.smartagriculture.backend.service.SymptomService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/symptoms")
public class SymptomController {

    private final SymptomService symptomService;

    public SymptomController(SymptomService symptomService) {
        this.symptomService = symptomService;
    }

    @GetMapping
    public List<Symptom> getAll() {
        return symptomService.getAll();
    }

    @GetMapping("/{id}")
    public Symptom getById(@PathVariable Long id) {
        return symptomService.getById(id);
    }

    @PostMapping
    public Symptom create(@RequestBody Symptom symptom) {
        return symptomService.create(symptom);
    }

    @PutMapping("/{id}")
    public Symptom update(
            @PathVariable Long id,
            @RequestBody Symptom symptom) {

        return symptomService.update(id, symptom);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {

        symptomService.delete(id);

        return "Xóa triệu chứng thành công";
    }
}